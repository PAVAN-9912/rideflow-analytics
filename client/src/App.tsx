import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { TripAnalytics } from "./pages/TripAnalytics";
import { DemandHotspots } from "./pages/DemandHotspots";
import { NearbyTrips } from "./pages/NearbyTrips";
import { Drivers } from "./pages/Drivers";
import { Trips } from "./pages/Trips";
import { TripDetails } from "./pages/TripDetails";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<TripAnalytics />} />
        <Route path="/hotspots" element={<DemandHotspots />} />
        <Route path="/nearby" element={<NearbyTrips />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:id" element={<TripDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
