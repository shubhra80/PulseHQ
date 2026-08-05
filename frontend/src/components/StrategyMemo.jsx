import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { LoadingState, ErrorState } from "./ui";

const CATEGORY_STYLE = {
  competitor: "bg-status-criticalBg text-status-critical",
  industry: "bg-brand-50 text-brand-700",
  opportunity: "bg-status-goodBg text-status-good",
};

const SECTIONS = [
  { key: "executive_summary", label: "Executive Summary" },
  { key: "portfolio_health_section", label: "Portfolio Health" },
  { key: "key_risks_section", label: "Key Risks" },
  { key: "adoption_opportunities_section", label: "Adoption Opportunities" },
  { key: "recommended_priorities_section", label: "Recommended Priorities" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// generate_ai.py stores bullet sections pipe-delimited ("point one|point two").
// Fall back to newlines, then a single paragraph, so this renders either way.
function SectionBody({ text }) {
  if (!text) return <p className="text-sm text-ink-primary">Not available for this memo.</p>;
  const points = text.includes("|") ? text.split("|") : text.split("\n");
  const items = points.map((p) => p.trim()).filter(Boolean);
  if (items.length <= 1) {
    return <p className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">{text}</p>;
  }
  return (
    <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-ink-primary">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function StrategyMemo() {
  const [memo, setMemo] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [{ data: memoData, error: memoError }, { data: newsData, error: newsError }] = await Promise.all([
          supabase.from("strategy_memos").select("*").order("memo_date", { ascending: false }).limit(1),
          supabase.from("market_news").select("*").order("published_date", { ascending: false }).limit(8),
        ]);
        if (cancelled) return;
        if (memoError || newsError) {
          setError((memoError || newsError).message);
        } else {
          setMemo((memoData ?? [])[0] ?? null);
          setNews(newsData ?? []);
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

  if (loading) return <LoadingState label="Loading strategy memo…" />;
  if (error) return <ErrorState message={`Couldn't load the strategy memo: ${error}`} />;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-ink-primary">Weekly Strategy Memo</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {memo ? `Generated ${formatDate(memo.memo_date)}` : "No memo has been generated yet."}
        </p>
      </header>

      {!memo ? (
        <div className="rounded-xl border border-line-hairline bg-surface p-8 text-center text-sm text-ink-muted">
          Run the AI content generation step to populate this week's strategy memo.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {SECTIONS.map((section) => (
              <section key={section.key} className="rounded-xl border border-line-hairline bg-surface p-5">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {section.label}
                </h2>
                <SectionBody text={memo[section.key]} />
              </section>
            ))}
          </div>

          <aside className="space-y-3">
            <h2 className="text-sm font-semibold text-ink-primary">Market Context</h2>
            {news.length === 0 && (
              <p className="text-sm text-ink-muted">No market news on file.</p>
            )}
            {news.map((item) => (
              <div key={item.id} className="rounded-xl border border-line-hairline bg-surface p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                      CATEGORY_STYLE[item.category] ?? "bg-surface-page text-ink-secondary"
                    }`}
                  >
                    {item.category ?? "news"}
                  </span>
                  <span className="text-[11px] text-ink-muted">{formatDate(item.published_date)}</span>
                </div>
                <div className="text-sm font-medium text-ink-primary">{item.headline}</div>
                {item.summary && <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{item.summary}</p>}
              </div>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
