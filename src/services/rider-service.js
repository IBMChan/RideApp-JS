//book a ride -- only if previous rides are completed or cancelled
//cancel a ride -- only if the status is requested
//make payment -- only if status is completed
//give rating -- only if status is completed
//ride history

import RidesRepository from "../repository/mongodb/rides.repository.js";

class RiderService {
  static async bookRide(data) {
    // Check last ride status
    const lastRide = await RidesRepository.findLastRide(data.rider_id);
    if (lastRide && lastRide.r_status !== "completed" && lastRide.r_status !== "cancelled") {
      throw new Error("You cannot book a new ride until the previous ride is completed/cancelled.");
    }
    return await RidesRepository.createRide(data);
  }

  static async cancelRide(rideId) {
    const ride = await RidesRepository.findById(rideId);
    if (!ride) throw new Error("Ride not found");

    if (["requested", "accepted"].includes(ride.r_status)) {
      return await RidesRepository.updateRide(rideId, { r_status: "cancelled" });
    } else {
      throw new Error("Only requested/accepted rides can be cancelled.");
    }
  }

  static async makePayment(rideId, paymentData) {
    const ride = await RidesRepository.findById(rideId);
    if (!ride) throw new Error("Ride not found");

    if (ride.r_status !== "completed") {
      throw new Error("Payment can only be made after ride completion.");
    }

    return await RidesRepository.updateRide(rideId, { payment: paymentData });
  }

  static async giveRating(rideId, ratingData) {
    const ride = await RidesRepository.findById(rideId);
    if (!ride) throw new Error("Ride not found");

    if (ride.r_status !== "completed") {
      throw new Error("You can only rate completed rides.");
    }

    return await RidesRepository.updateRide(rideId, { ratings: ratingData });
  }

  static async rideHistory(riderId) {
    return await RidesRepository.findByRiderId(riderId);
  }
}

export default RiderService;
