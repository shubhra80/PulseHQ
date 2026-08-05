import { useEffect, useMemo, useState } from "react";
import { supabase, FEATURES } from "../lib/supabase";
import { LoadingState, ErrorState, StatCard } from "./ui";

const STATUS_FILTERS = [
  { value: "all", label: "All clients" },
  { value: "healthy", label: "Healthy clients" },
  { value: "watch", label: "Watch clients" },
  { value: "at_risk", label: "At-risk clients" },
];

export default function AdoptionGap() {
  const [clients, setClients] = useState([]);
  const [adoption, setAdoption] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [{ data: clientData, error: clientError }, { data: adoptionData, error: adoptionError }] =
          await Promise.all([
            supabase.from("clients").select("id, name, health_status"),
            supabase.from("feature_adoption").select("client_id, feature_name, is_adopted, adoption_score"),
          ]);
        if (cancelled) return;
        if (clientError || adoptionError) {
          setError((clientError || adoptionError).message);
        } else {
          setClients(clientData ?? []);
          setAdoption(adoptionData ?? []);
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

  const stats = useMemo(() => {
    const eligibleIds = new Set(
      clients.filter((c) => statusFilter === "all" || c.health_status === statusFilter).map((c) => c.id)
    );
    const total = eligibleIds.size;

    const rows = FEATURES.map((name) => {
      const rowsForFeature = adoption.filter((a) => a.feature_name === name && eligibleIds.has(a.client_id));
      const adoptedRows = rowsForFeature.filter((a) => a.is_adopted);
      const adoptedCount = adoptedRows.length;
      const gapCount = total - adoptedCount;
      const adoptionRate = total > 0 ? Math.round((adoptedCount / total) * 100) : 0;
      const avgDepth =
        adoptedRows.length > 0
          ? Math.round(adoptedRows.reduce((sum, a) => sum + a.adoption_score, 0) / adoptedRows.length)
          : 0;
      return { name, adoptedCount, gapCount, adoptionRate, avgDepth, total };
    }).sort((a, b) => b.gapCount - a.gapCount);

    return { total, rows };
  }, [clients, adoption, statusFilter]);

  const topOpportunity = stats.rows[0];

  if (loading) return <LoadingState label="Analyzing adoption data…" />;
  if (error) return <ErrorState message={`Couldn't load adoption data: ${error}`} />;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-ink-primary">Adoption Gap Analyzer</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Feature adoption across {stats.total} {statusFilter === "all" ? "" : STATUS_FILTERS.find((s) => s.value === statusFilter)?.label.toLowerCase() + " "}
          accounts, ranked by biggest opportunity.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {STATUS_FILTERS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-surface-sidebar text-white"
                : "border border-line-hairline bg-surface text-ink-secondary hover:bg-surface-page"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {topOpportunity && (
        <div className="mb-6 rounded-xl border border-brand-500/20 bg-brand-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">Recommended Focus</div>
          <p className="mt-1 text-sm text-ink-secondary">
            <span className="font-semibold text-ink-primary">{topOpportunity.name}</span> is the biggest adoption
            gap — only {topOpportunity.adoptedCount} of {topOpportunity.total} accounts
            ({topOpportunity.adoptionRate}%) have adopted it. Closing this gap represents the single largest
            opportunity to lift portfolio health{statusFilter !== "all" ? " for this segment" : ""}.
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Accounts in view" value={stats.total} />
        <StatCard
          label="Widest gap"
          value={topOpportunity ? `${topOpportunity.gapCount}` : "—"}
          sublabel={topOpportunity?.name}
          accentClass="text-status-critical"
        />
        <StatCard
          label="Avg adoption rate"
          value={
            stats.rows.length > 0
              ? `${Math.round(stats.rows.reduce((s, r) => s + r.adoptionRate, 0) / stats.rows.length)}%`
              : "—"
          }
        />
        <StatCard label="Features tracked" value={FEATURES.length} />
      </div>

      <div className="rounded-xl border border-line-hairline bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">Adoption rate by feature</h2>
        <div className="space-y-4">
          {stats.rows.map((row, i) => (
            <div key={row.name}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium text-ink-primary">
                  <span className="mr-2 text-ink-muted">#{i + 1}</span>
                  {row.name}
                </span>
                <span className="tabular-nums text-ink-secondary">
                  {row.adoptedCount}/{row.total} adopted · {row.gapCount} gap
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-surface-page">
                <div
                  className="flex h-full items-center justify-end rounded-full bg-brand-500 px-2"
                  style={{ width: `${Math.max(row.adoptionRate, 6)}%` }}
                >
                  <span className="text-[11px] font-semibold tabular-nums text-white">{row.adoptionRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line-hairline bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-line-hairline bg-surface-page">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Feature</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Adopted</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Gap</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Adoption Rate</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Avg Depth (adopted)</th>
            </tr>
          </thead>
          <tbody>
            {stats.rows.map((row) => (
              <tr key={row.name} className="border-b border-line-hairline last:border-0">
                <td className="px-4 py-3 font-medium text-ink-primary">{row.name}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{row.adoptedCount}</td>
                <td className="px-4 py-3 text-right tabular-nums text-status-critical">{row.gapCount}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{row.adoptionRate}%</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{row.avgDepth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
