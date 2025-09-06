import { VehicleRepository } from "../repository/mysql/vehicles.repository.js";
import { RideRepository } from "../repository/mongodb/rides.repository.js";
import { sendRideStatusEmail } from "./notification-service.js";
import { findUserById } from "../repository/mysql/users.repository.js";

const vehicleRepo = new VehicleRepository();
const rideRepo = new RideRepository();

// Accept Ride
export async function acceptRide(driver_id, ride_id) {
  const vehicle = await vehicleRepo.getVehicleByDriver(driver_id);
  if (!vehicle) {
    throw new Error("Driver has no registered vehicle.");
  }

  const activeRides = await rideRepo.getActiveRidesByDriver(driver_id);
  if (activeRides.length > 0) {
    throw new Error("Previous rides are not completed.");
  }

  const ride = await rideRepo.acceptRide(driver_id, ride_id, vehicle.vehicle_id);
  if (!ride) {
    const existingRide = await rideRepo.getRideById(ride_id);
    if (!existingRide) throw new Error(`Ride ${ride_id} not found.`);
    throw new Error(`Ride ${ride_id} is not in a 'requested' state. Current status: ${existingRide.r_status}`);
  }

  try {
    const rider = await findUserById(ride.rider_id);
    if (rider && rider.email) {
      await sendRideStatusEmail({
        to: rider.email,
        riderName: rider.full_name,
        ride: {
          ride_id: ride.ride_id,
          pickup_location: ride.pickup_location,
          drop_location: ride.drop_location,
        },
        newStatus: "accepted",
      });
    }
  } catch (notifyErr) {
    console.error("[acceptRide] Notification error:", notifyErr?.message || notifyErr);
  }

  return ride;
}

// Update Ride Status
export async function updateRideStatus(driver_id, ride_id, status) {
  const ride = await rideRepo.getRideByDriverAndId(driver_id, ride_id);
  if (!ride) {
    throw new Error("Ride not found for this driver.");
  }

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
  const updatedRide = await rideRepo.saveRide(ride);

  try {
    const rider = await findUserById(ride.rider_id);
    if (rider && rider.email) {
      await sendRideStatusEmail({
        to: rider.email,
        riderName: rider.full_name,
        ride: {
          ride_id: updatedRide.ride_id,
          pickup_location: updatedRide.pickup_location,
          drop_location: updatedRide.drop_location,
        },
        newStatus: status,
      });
    }
  } catch (notifyErr) {
    console.error("[updateRideStatus] Notification error:", notifyErr?.message || notifyErr);
  }

  return updatedRide;
}

// Register Vehicle
export async function registerVehicle(driver_id, vehicleData) {
  return await vehicleRepo.registerVehicle(driver_id, vehicleData);
}

// Update Vehicle Details
export async function updateVehicle(driver_id, vehicleData) {
  return await vehicleRepo.updateVehicle(driver_id, vehicleData);
}

// Rate a Rider
export async function rateRider(ride_id, driver_id, rating, comment) {
  const ride = await rideRepo.getRideByDriverAndId(driver_id, ride_id);
  if (!ride) {
    throw new Error("Ride not found or driver not part of ride");
  }
  if (ride.r_status !== "completed") {
    throw new Error("Can only rate after ride completion");
  }

  if (!ride.ratings) {
    ride.ratings = {};
  }

  ride.ratings.d_to_r = { rate: rating, comment };
  return await rideRepo.saveRide(ride);
}