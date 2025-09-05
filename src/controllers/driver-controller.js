// ride-controller.js
import express from "express";
import { acceptRide, updateRideStatus, registerVehicle, updateVehicle,} from "../services/driver-service.js";


const router = express.Router();

// Accept a ride
router.post("/accept", async (req, res) => {
  const { driver_id, ride_id } = req.body;
  try {
    const ride = await acceptRide(driver_id, ride_id);
    res.status(200).json({ message: "Ride accepted", ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update ride status
router.patch("/status", async (req, res) => {
  console.log("[PATCH /driver/status] body:", req.body);
  const { driver_id, ride_id, status } = req.body;
  try {
    const ride = await updateRideStatus(driver_id, ride_id, status);
    console.log("[PATCH /driver/status] updated:", {
      ride_id: ride?.ride_id,
      newStatus: status,
      rider_id: ride?.rider_id,
    });
    res.status(200).json({ message: "Ride status updated", ride });
  } catch (err) {
    console.error("[PATCH /driver/status] error:", err?.message || err);
    res.status(400).json({ error: err.message });
  }
});

// Register vehicle
router.post("/vehicle/register", async (req, res) => {
  const { driver_id, vehicleData } = req.body;
  try {
    const vehicle = await registerVehicle(driver_id, vehicleData);
    res.status(201).json({ message: "Vehicle registered", vehicle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update vehicle
router.patch("/vehicle/update", async (req, res) => {
  const { driver_id, vehicleData } = req.body;
  try {
    const vehicle = await updateVehicle(driver_id, vehicleData);
    res.status(200).json({ message: "Vehicle updated", vehicle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
