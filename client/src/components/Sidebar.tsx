import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LineChart,
  MapPin,
  Navigation,
  Users,
  Table2,
  Settings,
  Route,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/analytics", label: "Trip Analytics", icon: LineChart },
  { to: "/hotspots", label: "Demand Hotspots", icon: MapPin },
  { to: "/nearby", label: "Nearby Trips", icon: Navigation },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/trips", label: "Trips", icon: Table2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col justify-between shrink-0 w-[232px] bg-navy border-r border-navyedge">
      <div>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-navyedge">
          <div className="flex items-center justify-center rounded-md w-[26px] h-[26px] bg-accent">
            <Route size={15} color="#fff" strokeWidth={2.4} />
          </div>
          <span className="font-display text-white text-[16px] tracking-wide">RideFlow</span>
        </div>

        <nav className="px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-navysoft text-white font-semibold" : "text-faint font-medium hover:bg-navysoft/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={2} color={isActive ? "#3160EE" : "#9BA1B4"} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-navyedge">
        <div className="flex items-center gap-2 text-xs text-faint">
          <span className="rounded-full w-1.5 h-1.5 bg-teal" />
          MongoDB connected
        </div>
      </div>
    </aside>
  );
}
