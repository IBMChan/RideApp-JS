import {bookRide, cancelRide, makePayment, giveRating, rideHistory,} from "../services/rider-service.js";

const riderController = {};

// Book a ride
riderController.bookRide = async (req, res) => {
  try {
    const rider_id = req.user.userId;
    const { pickup_location, drop_location } = req.body;
    const result = await bookRide(rider_id, pickup_location, drop_location);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cancel a ride
riderController.cancelRide = async (req, res) => {
  try {
    const rider_id = req.user.userId;
    const ride_id = parseInt(req.params.ride_id);
    const result = await cancelRide(rider_id, ride_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Make payment
riderController.makePayment = async (req, res) => {
  try {
    const rider_id = req.user.userId;
    const ride_id = parseInt(req.params.ride_id);
    const paymentDetails = req.body; // { payment_id, fare, mode }
    const result = await makePayment(rider_id, ride_id, paymentDetails);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Give rating
riderController.giveRating = async (req, res) => {
  try {
    const rider_id = req.user.userId;
    const ride_id = parseInt(req.params.ride_id); // CHANGE body TO params
    const { rate, comment } = req.body;
    const result = await giveRating(rider_id, ride_id, rate, comment);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ride history
riderController.rideHistory = async (req, res) => {
  try {
    const rider_id = req.user.userId;
    const rides = await rideHistory(rider_id);
    res.status(200).json(rides);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export default riderController;
