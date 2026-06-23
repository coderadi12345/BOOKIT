-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'organizer');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('event_viewed', 'booking_started', 'booking_confirmed', 'booking_cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "ActivityAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "events_date_time_idx" ON "events"("date_time");

-- CreateIndex
CREATE INDEX "events_title_idx" ON "events"("title");

-- CreateIndex for case-insensitive title search at scale
CREATE INDEX "events_title_lower_idx" ON "events"(lower("title"));

-- CreateIndex
CREATE INDEX "bookings_event_id_status_idx" ON "bookings"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_user_id_event_id_key" ON "bookings"("user_id", "event_id");

-- CreateIndex
CREATE INDEX "activity_log_event_id_action_idx" ON "activity_log"("event_id", "action");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
