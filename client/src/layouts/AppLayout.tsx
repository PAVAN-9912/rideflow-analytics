import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Trip Analytics",
  "/hotspots": "Demand Hotspots",
  "/nearby": "Nearby Trips",
  "/drivers": "Drivers",
  "/trips": "Trips",
  "/settings": "Settings",
};

export function AppLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? (pathname.startsWith("/trips/") ? "Trip Details" : "RideFlow");

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-paper text-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
