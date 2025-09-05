// rides.repository.js
import Ride from '../../entities/rides-schema.js';


class RidesRepository {
  static async createRide(data) {
    const ride = new Ride({ ...data, r_status: "requested", r_date: new Date() });
    return await ride.save();
  }

  static async findById(rideId) {
    return await Ride.findOne({ ride_id: rideId });
  }

  static async findLastRide(riderId) {
    return await Ride.findOne({ rider_id: riderId }).sort({ r_date: -1 });
  }

  static async updateRide(rideId, update) {
    return await Ride.findOneAndUpdate(
      { ride_id: rideId },
      { $set: update },
      { new: true }
    );
  }

  static async findByRiderId(riderId) {
    return await Ride.find({ rider_id: riderId });
  }
}

export default RidesRepository;
