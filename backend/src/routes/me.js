import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/bookings", requireAuth, async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            dateTime: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

export default router;
