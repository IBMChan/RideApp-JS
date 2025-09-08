import express from "express";
import riderController from "../controllers/rider-controller.js";
import { authMiddleware, requireRole } from "../middleware/auth-middleware.js";

const router = express.Router();

// Only authenticated riders can use these routes
router.use(authMiddleware, requireRole("rider"));

router.post("/book", riderController.bookRide);
router.post("/cancel/:ride_id", riderController.cancelRide);
router.post("/payment/:ride_id", riderController.makePayment);
router.post("/rate/:ride_id", riderController.giveRating);
router.get("/history", riderController.rideHistory);

export default router;
