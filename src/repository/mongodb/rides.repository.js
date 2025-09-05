import mongoose from "mongoose";

// Ride Schema
const rideSchema = new mongoose.Schema({
  ride_id: Number,
  rider_id: Number,
  driver_id: Number,
  vehicle_id: Number,
  pickup_location: String,
  drop_location: String,
  r_status: String, // requested, accepted, ongoing, completed, cancelled
  r_date: Date,
  payment: {
    payment_id: Number,
    fare: Number,
    mode: String,
    p_status: String,
    p_date: Date,
  },
  ratings: {
    rate_id: Number,
    r_to_d: {
      rate: Number,
      comment: String,
    },
    d_to_r: {
      rate: Number,
      comment: String,
    },
  },
});

const RideModel = mongoose.model("Ride", rideSchema);

class RidesRepository {
  static async createRide(data) {
    const ride = new RideModel({ ...data, r_status: "requested", r_date: new Date() });
    return await ride.save();
  }

  static async findById(rideId) {
    return await RideModel.findOne({ ride_id: rideId });
  }

  static async findLastRide(riderId) {
    return await RideModel.findOne({ rider_id: riderId }).sort({ r_date: -1 });
  }

  static async updateRide(rideId, update) {
    return await RideModel.findOneAndUpdate({ ride_id: rideId }, { $set: update }, { new: true });
  }

static async findByRiderId(riderId) {
  return await RideModel.find({ rider_id: Number(riderId) });
}

}

export default RidesRepository;
