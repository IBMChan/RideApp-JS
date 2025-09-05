import RiderService from "../services/rider-service.js";

class RideController {
  static async bookRide(req, res) {
    try {
      const result = await RiderService.bookRide(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async cancelRide(req, res) {
    try {
      const result = await RiderService.cancelRide(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async makePayment(req, res) {
    try {
      const result = await RiderService.makePayment(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async giveRating(req, res) {
    try {
      const result = await RiderService.giveRating(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async rideHistory(req, res) {
    try {
      const { rider_id } = req.params;
      const result = await RiderService.rideHistory(rider_id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default RideController;
