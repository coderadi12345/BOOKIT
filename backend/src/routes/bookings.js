import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { cancelBooking } from "../services/booking.js";

const router = Router();

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const booking = await cancelBooking(req.user.userId, req.params.id);
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

export default router;
