import { Router } from "express";
import dashboardRoutes from "./dashboard.routes";
import tripsRoutes from "./trips.routes";
import analyticsRoutes from "./analytics.routes";
import driversRoutes from "./drivers.routes";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/trips", tripsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/drivers", driversRoutes);

export default router;
