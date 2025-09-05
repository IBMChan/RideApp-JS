// ride-routes.js
import express from "express";
import rideController from "../controllers/ride-controller.js";

const router = express.Router();

// Mount the ride controller routes under /driver
router.use("/driver", rideController);

export default router;
