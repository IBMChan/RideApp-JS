//accept a ride -- only if previous rides are completed and also if vehicle is registered
//change the ride status --(requested -> accepted -> ongoing -> completed / cancelled only when status is accepted)
//vehicle registration (only one per driver)
//vehicle details updation 

// driver-service.js
import { pool } from "../config/mysql.js"; // MySQL connection
import mongoose from "mongoose";
import Ride from "../entities/rides-schema.js"; // MongoDB Ride model

// Accept Ride
export async function acceptRide(driver_id, ride_id) {
  try {
    const rideIdNum = Number(ride_id);
    if (!Number.isFinite(rideIdNum)) {
      throw new Error("Invalid ride_id. It must be a number.");
    }

    // Check if driver has registered a vehicle
    const [vehicles] = await pool.query(
      "SELECT vehicle_id FROM vehicles WHERE driver_id = ?",
      [driver_id]
    );
    if (vehicles.length === 0) {
      throw new Error("Driver has no registered vehicle.");
    }
    const vehicle_id = vehicles[0].vehicle_id;

    // Check previous rides are completed (block only ongoing/accepted rides different from this ride)
    const prevRides = await Ride.find({
      driver_id,
      r_status: { $in: ["accepted", "ongoing"] },
      $or: [
        { ride_id: { $nin: [rideIdNum, String(rideIdNum)] } },
        { rideid: { $nin: [rideIdNum, String(rideIdNum)] } },
        { rideId: { $nin: [rideIdNum, String(rideIdNum)] } },
      ],
    });
    if (prevRides.length > 0) {
      throw new Error("Previous rides are not completed.");
    }

    // Debug: check DB and matching docs
    try {
      const [matchCount, totalCount, sample] = await Promise.all([
        Ride.countDocuments({ ride_id: { $in: [rideIdNum, String(rideIdNum)] } }),
        Ride.estimatedDocumentCount(),
        Ride.find({}, { ride_id: 1, r_status: 1 }).limit(3).lean(),
      ]);
      console.log("[acceptRide] DB:", mongoose.connection.name, "Collection:", Ride.collection.name, "rideId:", rideIdNum, "matches:", matchCount, "total:", totalCount, "sample:", sample);
    } catch (dbgErr) {
      console.log("[acceptRide] Debug error:", dbgErr?.message);
    }

    // Update ride: find by any possible ride id field, assign driver and vehicle, set status to accepted
    const ride = await Ride.findOneAndUpdate(
      {
        r_status: "requested",
        $or: [
          { ride_id: { $in: [rideIdNum, String(rideIdNum)] } },
          { rideid: { $in: [rideIdNum, String(rideIdNum)] } },
          { rideId: { $in: [rideIdNum, String(rideIdNum)] } },
        ],
      },
      { $set: { r_status: "accepted", vehicle_id, driver_id } },
      { new: true }
    );

    if (!ride) {
      const existing = await Ride.findOne({ ride_id: { $in: [rideIdNum, String(rideIdNum)] } });
      if (!existing) {
        throw new Error(`Ride ${rideIdNum} not found.`);
      }
      if (existing.r_status !== "requested") {
        throw new Error(`Ride ${ride_id} is not in requested state. Current status: ${existing.r_status}`);
      }
      throw new Error("Ride could not be accepted due to a concurrency or data issue.");
    }

    // Notify rider on acceptance
    try {
      const [rows] = await pool.query(
        "SELECT email, full_name FROM users WHERE user_id = ? AND role = 'rider'",
        [ride.rider_id]
      );
      const riderEmail = rows?.[0]?.email || null;
      const riderName = rows?.[0]?.full_name || null;
      const { sendRideStatusEmail } = await import("./notification-service.js");
      console.log("[acceptRide] Sending email to:", riderEmail);
      await sendRideStatusEmail({
        to: riderEmail,
        riderName,
        ride: {
          ride_id: ride.ride_id,
          pickup_location: ride.pickup_location,
          drop_location: ride.drop_location,
        },
        newStatus: "accepted",
      });
    } catch (notifyErr) {
      console.error("[acceptRide] Notification error:", notifyErr?.message || notifyErr);
    }

    return ride;
  } catch (err) {
    throw err;
  }
}

//  Update Ride Status
export async function updateRideStatus(driver_id, ride_id, status) {
  try {
    const rideIdNum = Number(ride_id);
    const ride = await Ride.findOne({
      driver_id,
      $or: [
        { ride_id: { $in: [rideIdNum, String(rideIdNum), ride_id] } },
        { rideid: { $in: [rideIdNum, String(rideIdNum), ride_id] } },
        { rideId: { $in: [rideIdNum, String(rideIdNum), ride_id] } },
      ],
    });
    if (!ride) throw new Error("Ride not found.");

    console.log("[updateRideStatus] Found ride:", {
      ride_id: ride?.ride_id,
      current: ride?.r_status,
      requested: status,
      rider_id: ride?.rider_id,
      driver_id: ride?.driver_id,
    });

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

    // After successful status change, notify rider via email
    try {
      // Resolve rider email from MySQL users table
      const [rows] = await pool.query(
        "SELECT email, full_name FROM users WHERE user_id = ? AND role = 'rider'",
        [ride.rider_id]
      );
      const riderEmail = rows?.[0]?.email || null;
      const riderName = rows?.[0]?.full_name || null;
      console.log("[updateRideStatus] Resolved rider email:", riderEmail);

      // Lazy import to avoid circular deps and keep CJS/ESM mix from breaking
      const { sendRideStatusEmail } = await import("./notification-service.js");
      console.log("[updateRideStatus] Sending email...");
      await sendRideStatusEmail({
        to: riderEmail,
        riderName,
        ride: {
          ride_id: ride.ride_id,
          pickup_location: ride.pickup_location,
          drop_location: ride.drop_location,
        },
        newStatus: status,
      });
      console.log("[updateRideStatus] Email send requested");
    } catch (notifyErr) {
      console.error("Notification error:", notifyErr);
    }

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
