"""
Seed the `market_news` table with sample market news relevant to a SaaS
client-health / customer-success intelligence platform, spanning the
competitor / industry / opportunity categories the Weekly Strategy Memo
(View 4) draws on.

Usage:
    python seed/seed_news.py
"""
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from _supabase_client import get_client

NEWS_ITEMS = [
    # (headline, summary, category, days_ago)
    (
        "Rival CS Platform ChurnGuard Raises $40M Series C",
        "ChurnGuard closed a $40M round to expand its predictive churn scoring "
        "and plans to add AI-generated account summaries later this year — a "
        "direct overlap with PulseHQ's core health-scoring workflow.",
        "competitor",
        3,
    ),
    (
        "Gainsight Adds Native Slack Alerts for At-Risk Accounts",
        "Gainsight shipped real-time Slack notifications when an account's health "
        "score drops below a configurable threshold, reducing the lag between "
        "signal and CSM action.",
        "competitor",
        9,
    ),
    (
        "Totango Rebrands Around 'Outcome Management' Positioning",
        "Totango repositioned its platform around tracking customer outcomes "
        "rather than raw usage telemetry, signaling a broader industry shift "
        "away from activity metrics alone.",
        "competitor",
        21,
    ),
    (
        "New Entrant Vantage.ai Targets Mid-Market CS Teams with Low-Cost Tier",
        "A new startup launched a stripped-down health-scoring tool priced for "
        "teams under 500 accounts, undercutting incumbent CS platforms on price.",
        "competitor",
        34,
    ),
    (
        "Gartner: Customer Success Software Market to Grow 18% Annually Through 2028",
        "Gartner's latest market guide projects sustained double-digit growth in "
        "CS software spend, driven by SaaS companies prioritizing net revenue "
        "retention over new logo growth.",
        "industry",
        5,
    ),
    (
        "Survey: 62% of SaaS Companies Say Feature Adoption Data Is Their Biggest CS Blind Spot",
        "A cross-industry survey of 400 SaaS operators found feature-level "
        "adoption tracking ranked as the top gap in existing customer health "
        "programs, ahead of NPS and support ticket volume.",
        "industry",
        11,
    ),
    (
        "Product-Led Growth Cools as Boards Push for Higher Net Revenue Retention",
        "Investors are increasingly weighting NRR over new customer acquisition "
        "in SaaS valuations, pushing more budget toward expansion and retention "
        "tooling.",
        "industry",
        14,
    ),
    (
        "Report: AI-Generated Account Insights Cut CSM Prep Time by 30%",
        "A benchmarking report across 50 customer success teams found that "
        "pre-generated, cached AI account summaries reduced quarterly business "
        "review prep time by roughly a third compared to manual reporting.",
        "industry",
        18,
    ),
    (
        "Layoffs Hit Customer Success Orgs as Teams Consolidate Tooling",
        "Several mid-size SaaS companies cut CS headcount this quarter while "
        "consolidating around fewer, more automated health-monitoring tools — "
        "raising the bar for platforms that can demonstrate clear ROI.",
        "industry",
        26,
    ),
    (
        "SSO Adoption Becomes Table Stakes for Enterprise SaaS Renewals",
        "Enterprise buyers increasingly require SSO support as a renewal "
        "condition, making SSO adoption rate a leading indicator of enterprise "
        "account risk.",
        "industry",
        30,
    ),
    (
        "Analysts Flag Mobile Engagement as Underused Retention Signal",
        "Industry analysts note that mobile app usage remains one of the most "
        "underused engagement signals in health scoring models, despite "
        "correlating strongly with day-to-day product stickiness.",
        "opportunity",
        7,
    ),
    (
        "Mid-Market SaaS Buyers Want Adoption Gap Analysis, Not Just Health Scores",
        "Buyer interviews show growing demand for tools that go beyond a single "
        "health number to show specifically which features are underused and "
        "why — an opening for adoption-gap-focused reporting.",
        "opportunity",
        12,
    ),
    (
        "Verbatim Export Features See Rising Demand from Data-Governance-Conscious Buyers",
        "As enterprise data governance requirements tighten, demand is rising "
        "for granular, auditable data and verbatim export capabilities inside "
        "customer platforms.",
        "opportunity",
        16,
    ),
    (
        "Weekly Strategy Memos Emerge as Preferred Format for CS Leadership Reporting",
        "CS leaders increasingly favor short, synthesized weekly briefings over "
        "dashboards alone, citing faster executive alignment on where to focus "
        "retention efforts.",
        "opportunity",
        22,
    ),
    (
        "Load Prediction Tools Gain Traction Among Ops-Heavy SaaS Customers",
        "Customers in logistics and manufacturing verticals are showing above-"
        "average interest in load and capacity prediction features, suggesting "
        "a vertical-specific expansion opportunity.",
        "opportunity",
        28,
    ),
    (
        "Scheduling Feature Usage Correlates with Longer Customer Lifetime",
        "Early data across several SaaS platforms suggests accounts that adopt "
        "scheduling/automation features churn at roughly half the rate of "
        "accounts that don't.",
        "opportunity",
        33,
    ),
]


def main():
    client = get_client()
    today = date.today()

    rows = []
    for headline, summary, category, days_ago in NEWS_ITEMS:
        rows.append({
            "headline": headline,
            "summary": summary,
            "category": category,
            "published_date": (today - timedelta(days=days_ago)).isoformat(),
        })

    print("Clearing existing rows from market_news...")
    client.table("market_news").delete().neq("id", 0).execute()

    print(f"Inserting {len(rows)} market_news rows...")
    client.table("market_news").insert(rows).execute()

    print("Done seeding market news.")


if __name__ == "__main__":
    main()
