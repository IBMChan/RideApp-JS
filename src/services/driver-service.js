//accept a ride -- only if previous rides are completed and also if vehicle is registered
//change the ride status --(requested -> accepted -> ongoing -> completed / cancelled only when status is accepted)
//vehicle registration (only one per driver)
//vehicle details updation 

// driver-service.js
import { pool } from "./mysql.js"; // MySQL connection
import mongoose from "mongoose";
import Ride from "./ride-schema.js"; // MongoDB Ride model

// Accept Ride
export async function acceptRide(driver_id, ride_id) {
  try {
    // Check if driver has registered a vehicle
    const [vehicles] = await pool.query(
      "SELECT vehicle_id FROM vehicles WHERE driver_id = ?",
      [driver_id]
    );
    if (vehicles.length === 0) {
      throw new Error("Driver has no registered vehicle.");
    }
    const vehicle_id = vehicles[0].vehicle_id;

    // Check previous rides are completed
    const prevRides = await Ride.find({ driver_id, r_status: { $ne: "completed" } });
    if (prevRides.length > 0) {
      throw new Error("Previous rides are not completed.");
    }

    // Update ride status to accepted
    const ride = await Ride.findOneAndUpdate(
      { ride_id, driver_id },
      { r_status: "accepted", vehicle_id },
      { new: true }
    );

    if (!ride) throw new Error("Ride not found.");

    return ride;
  } catch (err) {
    throw err;
  }
}

//  Update Ride Status
export async function updateRideStatus(driver_id, ride_id, status) {
  try {
    const ride = await Ride.findOne({ ride_id, driver_id });
    if (!ride) throw new Error("Ride not found.");

    const validTransitions = {
      requested: ["accepted"],
      accepted: ["ongoing", "cancelled"],
      ongoing: ["completed"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[ride.r_status].includes(status)) {
      throw new Error(`Cannot change status from ${ride.r_status} to ${status}`);
    }

    ride.r_status = status;
    await ride.save();
    return ride;
  } catch (err) {
    throw err;
  }
}

// Vehicle Registration (only 1 per driver)
export async function registerVehicle(driver_id, vehicleData) {
  try {
    const [existing] = await pool.query(
      "SELECT vehicle_id FROM vehicles WHERE driver_id = ?",
      [driver_id]
    );

    if (existing.length > 0) {
      throw new Error("Driver already has a registered vehicle.");
    }

    const result = await pool.query(
      `INSERT INTO vehicles (driver_id, model, year, reg_number, plate_number, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        driver_id,
        vehicleData.model,
        vehicleData.year,
        vehicleData.reg_number,
        vehicleData.plate_number,
        vehicleData.color || null,
      ]
    );

    return { vehicle_id: result[0].insertId, ...vehicleData };
  } catch (err) {
    throw err;
  }
}

// Update Vehicle Details
export async function updateVehicle(driver_id, vehicleData) {
  try {
    const [existing] = await pool.query(
      "SELECT vehicle_id FROM vehicles WHERE driver_id = ?",
      [driver_id]
    );

    if (existing.length === 0) throw new Error("No vehicle registered for this driver.");

    const vehicle_id = existing[0].vehicle_id;

    await pool.query(
      `UPDATE vehicles SET model=?, year=?, reg_number=?, plate_number=?, color=? WHERE vehicle_id=?`,
      [
        vehicleData.model,
        vehicleData.year,
        vehicleData.reg_number,
        vehicleData.plate_number,
        vehicleData.color || null,
        vehicle_id,
      ]
    );

    return { vehicle_id, ...vehicleData };
  } catch (err) {
    throw err;
  }
}
