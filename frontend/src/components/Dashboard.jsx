import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  StatCard,
  StatusBadge,
  LoadingState,
  ErrorState,
  ScoreBar,
  healthScoreColor,
  healthBarColor,
} from "./ui";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "healthy", label: "Healthy" },
  { value: "watch", label: "Watch" },
  { value: "at_risk", label: "At Risk" },
];

const SORT_OPTIONS = [
  { value: "health_score_desc", label: "Health score (high → low)" },
  { value: "health_score_asc", label: "Health score (low → high)" },
  { value: "name_asc", label: "Name (A → Z)" },
];

function SortHeader({ label, active, direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-muted hover:text-ink-secondary"
    >
      {label}
      {active && (
        <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden="true">
          {direction === "asc" ? (
            <path d="M10 5l5 7H5l5-7z" />
          ) : (
            <path d="M10 15l-5-7h10l-5 7z" />
          )}
        </svg>
      )}
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sort, setSort] = useState("health_score_desc");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("clients")
          .select("*")
          .order("name", { ascending: true });
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setClients(data ?? []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const industries = useMemo(() => {
    const set = new Set(clients.map((c) => c.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [clients]);

  const summary = useMemo(() => {
    const total = clients.length;
    const healthy = clients.filter((c) => c.health_status === "healthy").length;
    const watch = clients.filter((c) => c.health_status === "watch").length;
    const atRisk = clients.filter((c) => c.health_status === "at_risk").length;
    return { total, healthy, watch, atRisk };
  }, [clients]);

  const visibleClients = useMemo(() => {
    let rows = clients;
    if (statusFilter !== "all") {
      rows = rows.filter((c) => c.health_status === statusFilter);
    }
    if (industryFilter !== "all") {
      rows = rows.filter((c) => c.industry === industryFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q));
    }
    const sorted = [...rows];
    if (sort === "health_score_desc") {
      sorted.sort((a, b) => b.health_score - a.health_score);
    } else if (sort === "health_score_asc") {
      sorted.sort((a, b) => a.health_score - b.health_score);
    } else if (sort === "name_asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [clients, statusFilter, industryFilter, search, sort]);

  function toggleHealthSort() {
    setSort((prev) => (prev === "health_score_desc" ? "health_score_asc" : "health_score_desc"));
  }

  if (loading) return <LoadingState label="Loading client portfolio…" />;
  if (error) return <ErrorState message={`Couldn't load clients: ${error}`} />;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-ink-primary">Client Health Dashboard</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Portfolio-wide health across {summary.total} accounts.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Clients" value={summary.total} />
        <StatCard label="Healthy" value={summary.healthy} accentClass="text-status-good" />
        <StatCard label="Watch" value={summary.watch} accentClass="text-status-warning" />
        <StatCard label="At Risk" value={summary.atRisk} accentClass="text-status-critical" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="w-56 rounded-lg border border-line-hairline bg-surface px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-line-hairline bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {STATUS_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="rounded-lg border border-line-hairline bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All industries</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto rounded-lg border border-line-hairline bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-muted">{visibleClients.length} shown</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line-hairline bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead className="border-b border-line-hairline bg-surface-page">
              <tr>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Client</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Industry</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader
                    label="Health Score"
                    active
                    direction={sort === "health_score_asc" ? "asc" : "desc"}
                    onClick={toggleHealthSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Usage</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Adoption</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Engagement</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="cursor-pointer border-b border-line-hairline last:border-0 hover:bg-surface-page"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-primary">{client.name}</div>
                    <div className="text-xs capitalize text-ink-muted">{client.tier}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{client.industry ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 tabular-nums font-semibold ${healthScoreColor(client.health_score)}`}>
                        {client.health_score}
                      </span>
                      <div className="w-20">
                        <ScoreBar value={client.health_score} colorClass={healthBarColor(client.health_score)} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={client.health_status} size="sm" />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{client.usage_depth_score}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{client.usage_breadth_score}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{client.user_reach_score}</td>
                </tr>
              ))}
              {visibleClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-muted">
                    No clients match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
