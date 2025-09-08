import RidesRepository from "../repository/mongodb/rides.repository.js";
import { findUserById } from "../repository/mysql/users.repository.js";
import { sendRideStatusEmail } from "./notification-service.js";

const rideRepo = new RidesRepository();

// Book a ride
export async function bookRide(rider_id, pickup_location, drop_location) {
  const lastRide = await rideRepo.getLastRide();
  const newRideId = lastRide ? lastRide.ride_id + 1 : 1;

  const rideData = {
    ride_id: newRideId,
    rider_id: rider_id,
    driver_id: null,
    vehicle_id: null,
    pickup_location,
    drop_location,
    r_status: "requested",
  };

  const ride = await rideRepo.createRide(rideData);

  return { message: "Ride booked successfully", ride };
}

// Cancel a ride
export async function cancelRide(rider_id, ride_id) {
  const ride = await rideRepo.getRideById(ride_id);
  if (!ride || ride.rider_id != rider_id)
    throw new Error("Ride not found with the given ride id.");

  if (!["requested", "accepted"].includes(ride.r_status))
    throw new Error(
      `Cannot cancel ride with status '${ride.r_status}'. Only requested or accepted rides can be cancelled.`
    );

  ride.r_status = "cancelled";
  const updatedRide = await rideRepo.saveRide(ride);

  // Send email if driver assigned
  if (ride.driver_id) {
    const rider = await findUserById(rider_id);
    if (rider?.email) {
      await sendRideStatusEmail({
        to: rider.email,
        riderName: rider.full_name,
        ride: {
          ride_id: updatedRide.ride_id,
          pickup_location: updatedRide.pickup_location,
          drop_location: updatedRide.drop_location,
        },
        newStatus: "cancelled",
      });
    }
  }

  return { message: "Ride cancelled successfully", ride: updatedRide };
}

// Make payment
export async function makePayment(rider_id, ride_id, paymentDetails) {
  const ride = await rideRepo.getRideById(ride_id);
  if (!ride || ride.rider_id != rider_id)
    throw new Error("Ride not found for this rider");

  if (ride.r_status !== "completed")
    throw new Error("Payment can only be made for completed rides");

  if (ride.payment?.fare)
    throw new Error("Payment has already been made for this ride");

  ride.payment = {
    payment_id: paymentDetails.payment_id,
    fare: paymentDetails.fare,
    mode: paymentDetails.mode,
    p_status: "completed",
    p_date: new Date(),
  };

  const updatedRide = await rideRepo.saveRide(ride);
  return { message: "Payment successful", ride: updatedRide };
}

// Give rating to driver
export async function giveRating(rider_id, ride_id, rate, comment) {
  const ride = await rideRepo.getRideById(ride_id);
  if (!ride || ride.rider_id != rider_id)
    throw new Error("Ride not found for this rider");

  if (ride.r_status !== "completed")
    throw new Error("Rating can only be given for completed rides");

  if (!ride.ratings) {
    ride.ratings = {};
  }
  ride.ratings.r_to_d = { rate, comment };

  const updatedRide = await rideRepo.saveRide(ride);
  return { message: "Rating submitted successfully", ride: updatedRide };
}

// Ride history
export async function rideHistory(rider_id) {
  const rides = await rideRepo.findByRiderId(rider_id);
  return rides;
}
