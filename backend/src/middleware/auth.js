import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { unauthorizedError, forbiddenError } from "../lib/errors.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const COOKIE_NAME = "bookit_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function setAuthCookie(res, payload) {
  const token = signToken(payload);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

export function requireAuth(req, _res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return next(unauthorizedError());
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(unauthorizedError());
  }
}

export function requireOrganizer(req, _res, next) {
  if (!req.user) {
    return next(unauthorizedError());
  }
  if (req.user.role !== Role.organizer) {
    return next(forbiddenError());
  }
  next();
}

export function optionalAuth(req, _res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore invalid token
    }
  }
  next();
}
