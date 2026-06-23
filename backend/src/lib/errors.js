export class AppError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";
  }
}

export function soldOutError() {
  return new AppError(409, "This event is sold out", "SOLD_OUT");
}

export function alreadyBookedError() {
  return new AppError(409, "You have already booked this event", "ALREADY_BOOKED");
}

export function unauthorizedError() {
  return new AppError(401, "Authentication required", "UNAUTHORIZED");
}

export function forbiddenError() {
  return new AppError(403, "You do not have permission to perform this action", "FORBIDDEN");
}

export function notFoundError(resource = "Resource") {
  return new AppError(404, `${resource} not found`, "NOT_FOUND");
}
