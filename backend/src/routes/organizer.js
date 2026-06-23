import { Router } from "express";
import { z } from "zod";
import { ActivityAction, BookingStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError, notFoundError } from "../lib/errors.js";
import { requireAuth, requireOrganizer } from "../middleware/auth.js";

const router = Router();

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  venue: z.string().min(1),
  dateTime: z.string().datetime(),
  capacity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const eventUpdateSchema = eventSchema.partial();

router.use(requireAuth, requireOrganizer);

router.post("/events", async (req, res, next) => {
  try {
    const body = eventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        organizerId: req.user.userId,
        title: body.title,
        description: body.description,
        venue: body.venue,
        dateTime: new Date(body.dateTime),
        capacity: body.capacity,
        price: body.price,
      },
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

router.patch("/events/:id", async (req, res, next) => {
  try {
    const body = eventUpdateSchema.parse(req.body);
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });

    if (!event || event.organizerId !== req.user.userId) {
      throw notFoundError("Event");
    }

    if (body.capacity !== undefined) {
      const soldCount = await prisma.booking.count({
        where: { eventId: event.id, status: BookingStatus.confirmed },
      });
      if (body.capacity < soldCount) {
        throw new AppError(
          400,
          `Capacity cannot be less than seats already booked (${soldCount})`,
          "CAPACITY_TOO_LOW"
        );
      }
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.venue !== undefined && { venue: body.venue }),
        ...(body.dateTime !== undefined && { dateTime: new Date(body.dateTime) }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.price !== undefined && { price: body.price }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.get("/events", async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.userId },
      include: {
        _count: {
          select: {
            bookings: { where: { status: BookingStatus.confirmed } },
          },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    const items = events.map((e) => ({
      id: e.id,
      title: e.title,
      venue: e.venue,
      dateTime: e.dateTime,
      capacity: e.capacity,
      price: e.price,
      seatsSold: e._count.bookings,
      seatsRemaining: e.capacity - e._count.bookings,
    }));

    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get("/events/:id/attendees", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event || event.organizerId !== req.user.userId) {
      throw notFoundError("Event");
    }

    const attendees = await prisma.booking.findMany({
      where: { eventId: event.id, status: BookingStatus.confirmed },
      include: {
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(
      attendees.map((b) => ({
        bookingId: b.id,
        userId: b.user.id,
        email: b.user.email,
        bookedAt: b.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.get("/events/:id/analytics", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event || event.organizerId !== req.user.userId) {
      throw notFoundError("Event");
    }

    const counts = await prisma.activityLog.groupBy({
      by: ["action"],
      where: { eventId: event.id },
      _count: { action: true },
    });

    const getCount = (action) =>
      counts.find((c) => c.action === action)?._count.action ?? 0;

    const totalViews = getCount(ActivityAction.event_viewed);
    const bookingsStarted = getCount(ActivityAction.booking_started);
    const bookingsConfirmed = getCount(ActivityAction.booking_confirmed);

    const conversionRate =
      totalViews > 0 ? Math.round((bookingsConfirmed / totalViews) * 10000) / 100 : 0;

    res.json({
      eventId: event.id,
      title: event.title,
      totalViews,
      bookingsStarted,
      bookingsConfirmed,
      conversionRate,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
