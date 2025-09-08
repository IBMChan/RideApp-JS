// src/routes/driver-routes.js
import express from "express";
import driverRouter from "../controllers/driver-controller.js";

const router = express.Router();

// Mount all driver controller routes
router.use("/", driverRouter);

export default router;
