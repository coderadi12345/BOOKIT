import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { clearAuthCookie, requireAuth, setAuthCookie } from "../middleware/auth.js";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["user", "organizer"]).optional().default("user"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/signup", async (req, res, next) => {
  try {
    const body = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new AppError(409, "Email already registered", "EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        role: body.role,
      },
    })
    setAuthCookie(res, { userId: user.id, email: user.email, role: user.role });
    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    setAuthCookie(res, { userId: user.id, email: user.email, role: user.role });
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      throw new AppError(401, "User not found", "UNAUTHORIZED");
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
