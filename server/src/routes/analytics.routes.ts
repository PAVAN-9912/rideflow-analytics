import { Router } from "express";
import {
  fareByHour,
  fareDistribution,
  hotspots,
  passengers,
  ratingDistribution,
  tripDuration,
  tripsByHour,
} from "../controllers/analytics.controller";

const router = Router();
router.get("/fare-by-hour", fareByHour);
router.get("/hotspots", hotspots);
router.get("/fare-distribution", fareDistribution);
router.get("/trip-duration", tripDuration);
router.get("/passengers", passengers);
router.get("/rating-distribution", ratingDistribution);
router.get("/trips-by-hour", tripsByHour);
export default router;
