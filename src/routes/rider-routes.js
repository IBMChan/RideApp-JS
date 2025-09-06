import express from "express";
import RiderController from "../controllers/rider-controller.js";

const router = express.Router();

// Rider routes

router.post("/book", RiderController.bookRide);
router.post("/cancel/:ride_id", RiderController.cancelRide);
router.get("/payment/:ride_id", RiderController.makePayment);
router.get("/rate/:rider_id", RiderController.giveRating);
router.get("/history/:rider_id", RiderController.rideHistory);

export default router;
