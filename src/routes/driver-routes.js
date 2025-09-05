import express from "express";
import driverController from "./driver-controller.js";

const router = express.Router();

// Mount the ride controller routes under /driver
router.use("/driver", driverController);

export default router;