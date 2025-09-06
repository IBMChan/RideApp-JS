// ride-schema.js

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  payment_id: Number,
  fare: Number,
  mode: String,
  p_status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  p_date: {
    type: Date,
    default: Date.now,
  },
});

const ratingSchema = new mongoose.Schema({
  rate_id: Number,
  d_to_r: {
    rate: Number,
    comment: String,
  },
});

const rideSchema = new mongoose.Schema({
  ride_id: {
    type: Number,
    required: true,
    unique: true,
  },
  rider_id: {
    type: String,
    required: true,
  },
  driver_id: {
    type: String,
    required: true,
  },
  vehicle_id: {
    type: Number,
    required: true,
  },
  pickup_location: {
    type: String,
    required: true,
  },
  drop_location: {
    type: String,
    required: true,
  },
  r_status: {
    type: String,
    enum: ["requested", "accepted", "ongoing", "completed", "cancelled"],
    default: "requested",
  },
  r_date: {
    type: Date,
    default: Date.now,
  },
  payment: paymentSchema,
  ratings: ratingSchema,
});

const Rides = mongoose.model("Ride", rideSchema);

export default Rides;
