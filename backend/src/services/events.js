import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const PAGE_SIZE = 20;

function mapEventRow(e) {
  const seatsSold = Number(e.seatsSold ?? e._count?.bookings ?? 0);
  const capacity = Number(e.capacity);
  const seatsRemaining = capacity - seatsSold;
  return {
    id: e.id,
    title: e.title,
    venue: e.venue,
    dateTime: e.dateTime,
    capacity,
    price: e.price,
    seatsRemaining,
    soldOut: seatsRemaining <= 0,
  };
}

/**
 * Uses lower(title) index-friendly ILIKE when searching; Prisma pagination otherwise.
 * Never loads full table — always LIMIT/OFFSET at the DB.
 */
export async function listUpcomingEvents({ search = "", date, page = 1 }) {
  const skip = (page - 1) * PAGE_SIZE;
  const now = new Date();

  if (search.trim()) {
    const pattern = `%${search.trim()}%`;
    const dateStart = date ? new Date(date) : null;
    const dateEnd = date ? new Date(date) : null;
    if (dateEnd) dateEnd.setDate(dateEnd.getDate() + 1);

    const dateClause = dateStart
      ? Prisma.sql`AND e.date_time >= ${dateStart} AND e.date_time < ${dateEnd}`
      : Prisma.sql`AND e.date_time >= ${now}`;

    const [rows, countResult] = await Promise.all([
      prisma.$queryRaw`
        SELECT e.id, e.title, e.venue, e.date_time AS "dateTime", e.capacity, e.price,
          (SELECT COUNT(*)::int FROM bookings b
           WHERE b.event_id = e.id AND b.status = 'confirmed') AS "seatsSold"
        FROM events e
        WHERE lower(e.title) LIKE lower(${pattern})
        ${dateClause}
        ORDER BY e.date_time ASC
        LIMIT ${PAGE_SIZE} OFFSET ${skip}
      `,
      prisma.$queryRaw`
        SELECT COUNT(*)::int AS count FROM events e
        WHERE lower(e.title) LIKE lower(${pattern})
        ${dateClause}
      `,
    ]);

    const total = countResult[0]?.count ?? 0;
    return {
      items: rows.map(mapEventRow),
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  const where = { dateTime: { gte: now } };

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.dateTime = { gte: start, lt: end };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { dateTime: "asc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        venue: true,
        dateTime: true,
        capacity: true,
        price: true,
        _count: {
          select: { bookings: { where: { status: BookingStatus.confirmed } } },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    items: events.map((e) => mapEventRow({ ...e, seatsSold: e._count.bookings })),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export { PAGE_SIZE };
