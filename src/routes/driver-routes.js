// ride-routes.js
import express from "express";
import driverController from "../controllers/driver-controller.js";

const router = express.Router();

// Mount the ride controller routes under /driver
router.use("/driver", driverController);

export default router;
