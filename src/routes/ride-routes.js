import express from "express";
import RiderController from "../controllers/rider-controller.js";

const router = express.Router();

// Rider routes
router.get("/history/:rider_id", RiderController.rideHistory);
router.post("/book", RiderController.bookRide);
router.post("/cancel/:ride_id", RiderController.cancelRide);
router.get("/status/:ride_id", RiderController.rideStatus);
router.get("/upcoming/:rider_id", RiderController.upcomingRides);

export default router;
