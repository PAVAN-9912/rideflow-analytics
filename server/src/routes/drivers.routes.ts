import { Router } from "express";
import { getDrivers, getTopDriversHandler } from "../controllers/drivers.controller";

const router = Router();
router.get("/top", getTopDriversHandler);
router.get("/", getDrivers);
export default router;
