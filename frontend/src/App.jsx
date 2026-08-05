import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ClientDetail from "./components/ClientDetail";
import AdoptionGap from "./components/AdoptionGap";
import StrategyMemo from "./components/StrategyMemo";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Weekly Strategy",
    end: true,
    icon: (
      <path
        fillRule="evenodd"
        d="M5 2a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 009.172 2H5zm5 5a1 1 0 011-1h.01a1 1 0 010 2H11a1 1 0 01-1-1zM6 11a1 1 0 100 2h7a1 1 0 100-2H6zm0 4a1 1 0 100 2h7a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    ),
  },
  {
    to: "/dashboard",
    label: "Client Health",
    icon: <path d="M3 13h4v7H3v-7zm7-6h4v13h-4V7zm7 3h4v10h-4V10z" />,
  },
  {
    to: "/adoption-gaps",
    label: "Adoption Gaps",
    icon: (
      <path
        fillRule="evenodd"
        d="M4 3a1 1 0 011 1v13h13a1 1 0 110 2H4a1 1 0 01-1-1V4a1 1 0 011-1zm14.7 3.7a1 1 0 010 1.4l-5 5a1 1 0 01-1.4 0L10 10.8l-3.3 3.3a1 1 0 01-1.4-1.4l4-4a1 1 0 011.4 0l2.3 2.3 4.3-4.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    ),
  },
];

function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-surface-sidebar text-slate-200">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
          P
        </div>
        <div>
          <div className="text-sm font-semibold text-white">PulseHQ</div>
          <div className="text-[11px] text-slate-400">Client Health Intelligence</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-surface-sidebarHover text-white"
                  : "text-slate-400 hover:bg-surface-sidebarHover hover:text-slate-100"
              }`
            }
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
              {item.icon}
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-slate-500">
        Portfolio data refreshed weekly
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-surface-page">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <Routes>
            <Route path="/" element={<StrategyMemo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/adoption-gaps" element={<AdoptionGap />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}