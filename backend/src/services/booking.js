import { ActivityAction, BookingStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { alreadyBookedError, notFoundError, soldOutError } from "../lib/errors.js";

function isDeadlock(err) {
  return err?.code === "P2034" || err?.meta?.code === "40P01";
}

async function bookEventTransaction(userId, eventId) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw`
      SELECT id, capacity FROM events WHERE id = ${eventId} FOR UPDATE
    `;

    if (locked.length === 0) {
      throw notFoundError("Event");
    }

    const event = locked[0];

    const existing = await tx.booking.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing?.status === BookingStatus.confirmed) {
      throw alreadyBookedError();
    }

    const confirmedCount = await tx.booking.count({
      where: { eventId, status: BookingStatus.confirmed },
    });

    if (confirmedCount >= event.capacity) {
      throw soldOutError();
    }

    await tx.activityLog.create({
      data: {
        eventId,
        userId,
        action: ActivityAction.booking_started,
      },
    });

    let booking;
    if (existing) {
      booking = await tx.booking.update({
        where: { id: existing.id },
        data: { status: BookingStatus.confirmed },
      });
    } else {
      booking = await tx.booking.create({
        data: { userId, eventId, status: BookingStatus.confirmed },
      });
    }

    await tx.activityLog.create({
      data: {
        eventId,
        userId,
        action: ActivityAction.booking_confirmed,
      },
    });

    return booking;
  });
}

export async function bookEvent(userId, eventId, retries = 3) {
  try {
    return await bookEventTransaction(userId, eventId);
  } catch (err) {
    if (retries > 0 && isDeadlock(err)) {
      return bookEvent(userId, eventId, retries - 1);
    }
    throw err;
  }
}

export async function cancelBooking(userId, bookingId) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw notFoundError("Booking");
    }

    if (booking.userId !== userId) {
      throw notFoundError("Booking");
    }

    if (booking.status === BookingStatus.cancelled) {
      return booking;
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.cancelled },
    });

    await tx.activityLog.create({
      data: {
        eventId: booking.eventId,
        userId,
        action: ActivityAction.booking_cancelled,
      },
    });

    return updated;
  });
}

export async function getSeatsRemaining(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return 0;

  const confirmedCount = await prisma.booking.count({
    where: { eventId, status: BookingStatus.confirmed },
  });

  return Math.max(0, event.capacity - confirmedCount);
}
