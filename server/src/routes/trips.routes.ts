import { Router } from "express";
import { getNearbyTrips, getTripDetail, getTrips } from "../controllers/trips.controller";

const router = Router();
// IMPORTANT: /nearby must be registered before /:id or Express will treat "nearby" as an id.
router.get("/nearby", getNearbyTrips);
router.get("/:id", getTripDetail);
router.get("/", getTrips);
export default router;
