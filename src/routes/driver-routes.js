// src/routes/driver-routes.js
import express from "express";
import driverRouter from "../controllers/driver-controller.js";
import { authMiddleware, requireRole } from "../middleware/auth-middleware.js";

const router = express.Router();

router.use(authMiddleware, requireRole("driver"));

// Mount all driver controller routes
router.use("/", driverRouter);

export default router;
