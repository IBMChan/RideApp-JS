// src/routes/rider-routes.js
import express from "express";
import riderController from "../controllers/rider-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

// Protect all rider routes
router.use(authMiddleware);


router.post("/book", riderController.bookRide);
router.post("/cancel/:ride_id", riderController.cancelRide);
router.post("/payment/:ride_id", riderController.makePayment);
router.post("/rate/:ride_id", riderController.giveRating);
router.get("/history", riderController.rideHistory);


export default router;
