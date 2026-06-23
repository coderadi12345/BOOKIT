import { Router } from "express";
import { ActivityAction, BookingStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { notFoundError } from "../lib/errors.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { bookEvent, getSeatsRemaining } from "../services/booking.js";
import { listUpcomingEvents } from "../services/events.js";

const router = Router();

router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const date = req.query.date;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const result = await listUpcomingEvents({ search, date, page });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        organizer: { select: { email: true } },
        _count: {
          select: {
            bookings: { where: { status: BookingStatus.confirmed } },
          },
        },
      },
    });

    if (!event) {
      throw notFoundError("Event");
    }

    await prisma.activityLog.create({
      data: {
        eventId: event.id,
        userId: req.user?.userId ?? null,
        action: ActivityAction.event_viewed,
      },
    });

    const seatsSold = event._count.bookings;
    const seatsRemaining = event.capacity - seatsSold;

    res.json({
      id: event.id,
      title: event.title,
      description: event.description,
      venue: event.venue,
      dateTime: event.dateTime,
      capacity: event.capacity,
      price: event.price,
      organizerEmail: event.organizer.email,
      seatsRemaining,
      soldOut: seatsRemaining <= 0,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/book", requireAuth, async (req, res, next) => {
  try {
    const booking = await bookEvent(req.user.userId, req.params.id);
    const seatsRemaining = await getSeatsRemaining(req.params.id);
    res.status(201).json({ booking, seatsRemaining });
  } catch (err) {
    next(err);
  }
});

export default router;
