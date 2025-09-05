// driver-service.js
import { VehicleRepository } from "../repository/mysql/vehicles.repository.js";
import { RideRepository } from "../repository/mongodb/rides.repository.js";

const vehicleRepo = new VehicleRepository();
const rideRepo = new RideRepository();

// Accept Ride
export async function acceptRide(driver_id, ride_id) {
  // Check if driver has registered a vehicle
  const vehicle = await vehicleRepo.getVehicleByDriver(driver_id);
  if (!vehicle) {
    throw new Error("Driver has no registered vehicle.");
  }

  // Check previous rides are completed
  const prevRides = await rideRepo.getActiveRidesByDriver(driver_id);
  if (prevRides.length > 0) {
    throw new Error("Previous rides are not completed.");
  }

  // Update ride status
  const ride = await rideRepo.updateRideStatus(driver_id, ride_id, "accepted", vehicle.vehicle_id);
  if (!ride) throw new Error("Ride not found.");

  return ride;
}

// Update Ride Status
export async function updateRideStatus(driver_id, ride_id, status) {
  const ride = await rideRepo.getRideByDriver(driver_id, ride_id);
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
  return await rideRepo.saveRide(ride);
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
  const ride = await rideRepo.getRideByDriver(driver_id, ride_id);
  if (!ride) throw new Error("Ride not found or driver not part of ride");
  if (ride.r_status !== "completed") throw new Error("Can only rate after ride completion");

  // ensure ratings object exists
  if (!ride.ratings) {
    ride.ratings = {};
  }

  ride.ratings.d_to_r = { rate: rating, comment };
  return await rideRepo.saveRide(ride);
}
