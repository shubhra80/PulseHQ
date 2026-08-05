import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, FEATURES } from "../lib/supabase";
import {
  StatusBadge,
  LoadingState,
  ErrorState,
  ScoreBar,
  healthScoreColor,
  healthBarColor,
} from "./ui";

const COMPONENT_META = [
  { key: "usage_breadth_score", label: "Usage Breadth", weight: "30%", hint: "Share of the 8 features adopted" },
  { key: "usage_depth_score", label: "Usage Depth", weight: "40%", hint: "Frequency & volume of usage per feature" },
  { key: "user_reach_score", label: "User Reach", weight: "30%", hint: "Share of licensed users actively using it" },
];

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function buildRiskIndicators(client, features) {
  const risks = [];
  if (client.health_status === "at_risk") {
    risks.push("Overall health is At Risk — this account is a churn candidate this quarter.");
  } else if (client.health_status === "watch") {
    risks.push("Overall health is on Watch — trending signals need monitoring.");
  }
  const notAdopted = features.filter((f) => !f.is_adopted);
  if (notAdopted.length >= 5) {
    risks.push(`Only ${8 - notAdopted.length} of 8 features adopted — low product surface area.`);
  }
  if (client.user_reach_score < 30) {
    risks.push(`User reach is ${client.user_reach_score}/100 — few licensed users are actively engaged.`);
  }
  const sso = features.find((f) => f.feature_name === "SSO");
  if (sso && !sso.is_adopted && client.tier !== "generated") {
    risks.push("SSO not adopted — a common blocker to enterprise renewal.");
  }
  const stale = features.filter((f) => f.is_adopted && f.last_used && daysAgo(f.last_used) > 30);
  if (stale.length > 0) {
    risks.push(`${stale.length} adopted feature${stale.length > 1 ? "s" : ""} not used in 30+ days.`);
  }
  return risks;
}

function daysAgo(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [{ data: clientData, error: clientError }, { data: featureData, error: featureError }] =
          await Promise.all([
            supabase.from("clients").select("*").eq("id", id).single(),
            supabase.from("feature_adoption").select("*").eq("client_id", id),
          ]);
        if (cancelled) return;
        if (clientError) {
          setError(clientError.message);
        } else {
          setClient(clientData);
          const byName = new Map((featureData ?? []).map((f) => [f.feature_name, f]));
          setFeatures(FEATURES.map((name) => byName.get(name) ?? { feature_name: name, is_adopted: false, adoption_score: 0 }));
          if (featureError) setError(featureError.message);
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
  }, [id]);

  if (loading) return <LoadingState label="Loading client…" />;
  if (error) return <ErrorState message={`Couldn't load this client: ${error}`} />;
  if (!client) return <ErrorState message="Client not found." />;

  const risks = buildRiskIndicators(client, features);
  const topDrivers = [...features].filter((f) => f.is_adopted).sort((a, b) => b.adoption_score - a.adoption_score).slice(0, 3);
  const biggestGaps = [...features].filter((f) => !f.is_adopted);

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-secondary hover:text-ink-primary">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.7 4.3a1 1 0 010 1.4L8.42 10l4.28 4.3a1 1 0 01-1.4 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z" clipRule="evenodd" />
        </svg>
        Back to dashboard
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-ink-primary">{client.name}</h1>
            <StatusBadge status={client.health_status} />
          </div>
          <p className="mt-1 text-sm capitalize text-ink-secondary">
            {client.tier} account · {client.industry ?? "Unspecified industry"}
          </p>
        </div>
        <div className="rounded-xl border border-line-hairline bg-surface px-5 py-3 text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">Health Score</div>
          <div className={`text-3xl font-semibold tabular-nums ${healthScoreColor(client.health_score)}`}>
            {client.health_score}
          </div>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {COMPONENT_META.map((c) => (
          <div key={c.key} className="rounded-xl border border-line-hairline bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{c.label}</span>
              <span className="text-[11px] text-ink-muted">weight {c.weight}</span>
            </div>
            <div className="mt-1.5 text-2xl font-semibold tabular-nums text-ink-primary">{client[c.key]}</div>
            <div className="mt-2">
              <ScoreBar value={client[c.key]} colorClass={healthBarColor(client[c.key])} />
            </div>
            <div className="mt-2 text-xs text-ink-secondary">{c.hint}</div>
          </div>
        ))}
      </section>

      <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-line-hairline bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink-primary">What's driving the score up</h2>
          {topDrivers.length === 0 ? (
            <p className="text-sm text-ink-muted">No strongly adopted features yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-ink-secondary">
              {topDrivers.map((f) => (
                <li key={f.feature_name} className="flex items-center justify-between">
                  <span>{f.feature_name}</span>
                  <span className="tabular-nums text-status-good">{f.adoption_score}/100</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-line-hairline bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink-primary">What's driving the score down</h2>
          {biggestGaps.length === 0 ? (
            <p className="text-sm text-ink-muted">All 8 features are adopted.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-ink-secondary">
              {biggestGaps.map((f) => (
                <li key={f.feature_name} className="flex items-center justify-between">
                  <span>{f.feature_name}</span>
                  <span className="text-status-critical">Not adopted</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {risks.length > 0 && (
        <section className="mb-6 rounded-xl border border-status-critical/30 bg-status-criticalBg p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-status-critical">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Risk Indicators
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-status-critical/90">
            {risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-brand-500/20 bg-brand-50 p-4">
          <h2 className="mb-1.5 text-sm font-semibold text-brand-700">AI Insight</h2>
          <p className="text-sm text-ink-secondary">
            {client.ai_insight || "No AI insight has been generated for this client yet."}
          </p>
        </div>
        <div className="rounded-xl border border-line-hairline bg-surface p-4">
          <h2 className="mb-1.5 text-sm font-semibold text-ink-primary">Recommended Action</h2>
          <p className="text-sm text-ink-secondary">
            {client.ai_recommendation || "No recommendation has been generated for this client yet."}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-line-hairline bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink-primary">Feature-by-Feature Breakdown</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.feature_name} className="rounded-lg border border-line-hairline p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-primary">{f.feature_name}</span>
                {f.is_adopted ? (
                  <span className="text-[11px] font-medium text-status-good">Adopted</span>
                ) : (
                  <span className="text-[11px] font-medium text-ink-muted">Not adopted</span>
                )}
              </div>
              <div className="mt-2">
                <ScoreBar value={f.adoption_score} colorClass={healthBarColor(f.adoption_score)} />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs text-ink-muted">
                <span className="tabular-nums">{f.adoption_score}/100</span>
                <span>{f.last_used ? `Used ${formatDate(f.last_used)}` : "Never used"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
