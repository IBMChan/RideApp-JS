// src/controllers/driver-controller.js
import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  acceptRide,
  updateRideStatus,
  registerVehicle,
  updateVehicle,
  rateRider,
} from "../services/driver-service.js";

const router = express.Router();

// Require auth for all driver routes
router.use(authMiddleware);

// Accept a ride
router.post("/accept", async (req, res) => {
  const driver_id = req.user.userId;
  const { ride_id } = req.body;
  try {
    const ride = await acceptRide(driver_id, ride_id);
    res.status(200).json({ message: "Ride accepted", ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update ride status
router.patch("/status", async (req, res) => {
  const driver_id = req.user.userId;
  const { ride_id, status } = req.body;
  try {
    const ride = await updateRideStatus(driver_id, ride_id, status);
    res.status(200).json({ message: "Ride status updated", ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register vehicle
router.post("/vehicle/register", async (req, res) => {
  const driver_id = req.user.userId;
  const vehicleData = req.body;
  try {
    const vehicle = await registerVehicle(driver_id, vehicleData);
    res.status(201).json({ message: "Vehicle registered", vehicle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update vehicle
router.patch("/vehicle/update", async (req, res) => {
  const driver_id = req.user.userId;
  const vehicleData = req.body;
  try {
    const vehicle = await updateVehicle(driver_id, vehicleData);
    res.status(200).json({ message: "Vehicle updated", vehicle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rate rider
router.post("/rate/rider", async (req, res) => {
  const driver_id = req.user.userId;
  const { ride_id, rating, comment } = req.body;
  try {
    const result = await rateRider(ride_id, driver_id, rating, comment);
    res.status(200).json({ message: "Rider rated successfully", result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
