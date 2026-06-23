import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const organizer = await prisma.user.upsert({
    where: { email: "organizer@bookit.com" },
    update: {},
    create: {
      email: "organizer@bookit.com",
      passwordHash,
      role: Role.organizer,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@bookit.com" },
    update: {},
    create: {
      email: "user@bookit.com",
      passwordHash,
      role: Role.user,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@bookit.com" },
    update: {},
    create: {
      email: "jane@bookit.com",
      passwordHash,
      role: Role.user,
    },
  });

  const existingEvents = await prisma.event.count({
    where: { organizerId: organizer.id },
  });

  if (existingEvents > 0) {
    console.log("Seed skipped — sample data already exists.");
    console.log("Organizer: organizer@bookit.com / password123");
    console.log("User: user@bookit.com / password123");
    console.log("User: jane@bookit.com / password123");
    return;
  }

  const events = await Promise.all([
    prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: "Summer Jazz Night",
        description: "An evening of smooth jazz under the stars.",
        venue: "Riverside Amphitheater",
        dateTime: new Date("2026-08-15T19:00:00Z"),
        capacity: 100,
        price: 45.0,
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: "Tech Conference 2026",
        description: "Annual gathering of developers and innovators.",
        venue: "Convention Center Hall A",
        dateTime: new Date("2026-09-20T09:00:00Z"),
        capacity: 500,
        price: 199.0,
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: "Indie Film Festival",
        description: "Showcase of independent filmmakers from around the world.",
        venue: "Downtown Cinema",
        dateTime: new Date("2026-07-10T18:00:00Z"),
        capacity: 2,
        price: 25.0,
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: "Food & Wine Expo",
        description: "Taste dishes from top local chefs paired with fine wines.",
        venue: "Grand Hotel Ballroom",
        dateTime: new Date("2026-10-05T17:00:00Z"),
        capacity: 150,
        price: 75.0,
      },
    }),
    prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: "Yoga in the Park",
        description: "Morning yoga session for all skill levels.",
        venue: "Central Park Meadow",
        dateTime: new Date("2026-06-30T07:00:00Z"),
        capacity: 50,
        price: 15.0,
      },
    }),
  ]);

  await prisma.booking.create({
    data: {
      userId: user.id,
      eventId: events[2].id,
      status: "confirmed",
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { eventId: events[0].id, userId: user.id, action: "event_viewed" },
      { eventId: events[0].id, userId: user2.id, action: "event_viewed" },
      { eventId: events[0].id, userId: user.id, action: "booking_started" },
      { eventId: events[0].id, userId: user.id, action: "booking_confirmed" },
      { eventId: events[2].id, userId: user.id, action: "event_viewed" },
      { eventId: events[2].id, userId: user.id, action: "booking_started" },
      { eventId: events[2].id, userId: user.id, action: "booking_confirmed" },
    ],
  });

  console.log("Seed complete!");
  console.log("Organizer: organizer@bookit.com / password123");
  console.log("User: user@bookit.com / password123");
  console.log("User: jane@bookit.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
