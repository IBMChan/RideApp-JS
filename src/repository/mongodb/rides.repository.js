// rides.repository.js
import Ride from "../../entities/rides-schema.js";

export class RideRepository {
  async getRideById(ride_id) {
    return await Ride.findOne({ ride_id });
  }

  async getRideByDriver(driver_id, ride_id) {
    return await Ride.findOne({ ride_id, driver_id });
  }

  async getActiveRidesByDriver(driver_id) {
    return await Ride.find({ driver_id, r_status: { $ne: "completed" } });
  }

  
  async updateRideStatus(driver_id, ride_id, status, vehicle_id = null) {
    return await Ride.findOneAndUpdate(
      { ride_id, driver_id: null, r_status: "requested" },//
      { driver_id: driver_id,r_status: status, ...(vehicle_id && { vehicle_id }) },
      { new: true }
    );
  }

  async saveRide(ride) {
    return await ride.save();
  }
}
