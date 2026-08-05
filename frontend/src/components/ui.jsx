const STATUS_META = {
  healthy: {
    label: "Healthy",
    text: "text-status-good",
    bg: "bg-status-goodBg",
    dot: "bg-status-good",
    icon: (
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.3 6.3-6.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    ),
  },
  watch: {
    label: "Watch",
    text: "text-status-warning",
    bg: "bg-status-warningBg",
    dot: "bg-status-warning",
    icon: (
      <path d="M10 2a1 1 0 01.9.55l7 14A1 1 0 0117 18H3a1 1 0 01-.9-1.45l7-14A1 1 0 0110 2zm0 5a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1zm0 7a1 1 0 100 2 1 1 0 000-2z" />
    ),
  },
  at_risk: {
    label: "At Risk",
    text: "text-status-critical",
    bg: "bg-status-criticalBg",
    dot: "bg-status-critical",
    icon: (
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    ),
  },
};

export function StatusBadge({ status, size = "md" }) {
  const meta = STATUS_META[status] ?? STATUS_META.watch;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${meta.bg} ${meta.text} ${pad}`}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
        {meta.icon}
      </svg>
      {meta.label}
    </span>
  );
}

export function statusMeta(status) {
  return STATUS_META[status] ?? STATUS_META.watch;
}

export function healthScoreColor(score) {
  if (score >= 75) return "text-status-good";
  if (score >= 40) return "text-status-warning";
  return "text-status-critical";
}

export function healthBarColor(score) {
  if (score >= 75) return "bg-status-good";
  if (score >= 40) return "bg-status-warning";
  return "bg-status-critical";
}

export function ScoreBar({ value, colorClass = "bg-brand-500", trackClass = "bg-line-hairline" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full ${trackClass}`}>
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatCard({ label, value, sublabel, accentClass = "text-ink-primary" }) {
  return (
    <div className="rounded-xl border border-line-hairline bg-surface p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums ${accentClass}`}>{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-ink-secondary">{sublabel}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-xl border border-status-critical/30 bg-status-criticalBg p-4 text-sm text-status-critical">
      {message}
    </div>
  );
}
