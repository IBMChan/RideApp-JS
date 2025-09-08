import Ride from "../../entities/rides-schema.js";

class RidesRepository {
  async getRideById(ride_id) {
    return await Ride.findOne({ ride_id });
  }

  async createRide(ride) {
    const newRide = new Ride(ride);
    return await newRide.save();
  }


  async saveRide(ride) {
    return await ride.save();
  }
  
  async getLastRide() {
    return await Ride.findOne().sort({ ride_id: -1 });
  }


  async getRidesByRider(rider_id) {
    return await Ride.find({ rider_id }).sort({ r_date: -1 });
  }

  async getRideByDriver(driver_id, ride_id) {
    return await Ride.findOne({ driver_id, ride_id });
  }

  async getActiveRidesByDriver(driver_id) {
    return await Ride.find({ driver_id, r_status: { $ne: "completed" } });
  }

  async updateRideStatus(driver_id, ride_id, status, vehicle_id = null) {
    return await Ride.findOneAndUpdate(
      { ride_id, driver_id: null, r_status: "requested" },
      { driver_id, r_status: status, ...(vehicle_id && { vehicle_id }) },
      { new: true }
    );
  }

  // ✅ Rider history
  async findByRiderId(rider_id) {
    return await Ride.find({ rider_id }).sort({ r_date: -1 });
  }

  // ✅ Driver history
  async findByDriverId(driver_id) {
    return await Ride.find({ driver_id }).sort({ r_date: -1 });
  }

  async saveRide(ride) {
    return await ride.save();
  }

  // ✅ Get last ride for auto-increment ride_id
  async getLastRide() {
    return await Ride.findOne().sort({ ride_id: -1 });
  }
}

export default RidesRepository;
