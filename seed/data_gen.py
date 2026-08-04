"""
Deterministic fictional data generator for PulseHQ.

Generates 100 client profiles (15 fictional + 35 enterprise + 50 generated),
each with 8 feature-adoption records and health scores derived ONLY from
usage behavior (breadth / depth / reach) — never from company tier or size.
This module does no I/O; seed_clients.py and seed_features.py both import
it so the numbers they insert stay consistent with each other.
"""
import random

SEED = 42

FEATURES = [
    "SSO",
    "Customize Dashboard",
    "Insights",
    "Data Exports",
    "Verbatim Exports",
    "Scheduling",
    "Load Prediction",
    "Mobile App",
]

# ------------------------------------------------------------------
# Tier 1 — 15 recognizable fictional companies
# ------------------------------------------------------------------
TIER1 = [
    ("Dunder Mifflin", "Paper & Packaging"),
    ("Pied Piper Technologies", "Technology"),
    ("Initech Solutions", "Technology"),
    ("Vandelay Industries", "Import / Export"),
    ("Acme Corporation", "Manufacturing"),
    ("Bluth Company", "Real Estate"),
    ("Prestige Worldwide", "Media & Entertainment"),
    ("Waystar Royco", "Media & Entertainment"),
    ("Sterling Cooper", "Advertising"),
    ("Globex Corporation", "Conglomerate"),
    ("Umbrella Corp", "Pharmaceuticals"),
    ("Cyberdyne Systems", "Robotics & AI"),
    ("Stark Industries", "Aerospace & Defense"),
    ("Wonka Industries", "Consumer Goods"),
    ("Hooli", "Technology"),
]

# ------------------------------------------------------------------
# Tier 2 — 35 realistic enterprise companies
# ------------------------------------------------------------------
TIER2 = [
    ("Meridian Analytics", "Data & Analytics"),
    ("Apex Logistics", "Logistics"),
    ("Crestview Financial", "Finance"),
    ("Northbridge Consulting", "Consulting"),
    ("Summit Data Systems", "Data & Analytics"),
    ("Vantage Group", "Consulting"),
    ("Pinnacle Solutions", "Technology"),
    ("Horizon Technologies", "Technology"),
    ("BlueSky Analytics", "Data & Analytics"),
    ("Cornerstone Ventures", "Finance"),
    ("Silverline Systems", "Technology"),
    ("Cascade Digital", "Technology"),
    ("Ironwood Consulting", "Consulting"),
    ("Coastline Data", "Data & Analytics"),
    ("Redwood Technologies", "Technology"),
    ("Clearwater Analytics", "Data & Analytics"),
    ("Bridgepoint Solutions", "Technology"),
    ("Highmark Systems", "Technology"),
    ("Lakeside Technologies", "Technology"),
    ("Mountainview Data", "Data & Analytics"),
    ("Riverview Analytics", "Data & Analytics"),
    ("Oakwood Solutions", "Technology"),
    ("Elmwood Technologies", "Technology"),
    ("Maple Leaf Systems", "Technology"),
    ("Birchwood Analytics", "Data & Analytics"),
    ("Cedarview Solutions", "Technology"),
    ("Pinewood Data", "Data & Analytics"),
    ("Willowbrook Technologies", "Technology"),
    ("Ashford Analytics", "Data & Analytics"),
    ("Foxwood Systems", "Technology"),
    ("Thornberry Solutions", "Technology"),
    ("Greenfield Technologies", "Technology"),
    ("Westbrook Data", "Data & Analytics"),
    ("Eastview Analytics", "Data & Analytics"),
    ("Northwood Systems", "Technology"),
]

# ------------------------------------------------------------------
# Tier 3 — 50 generated B2B companies across 5 industries
# ------------------------------------------------------------------
TIER3_INDUSTRIES = {
    "Healthcare": {
        "prefixes": ["Med", "Health", "Vitality", "Care", "Clinix", "Wellpoint", "Pulse", "BioBridge", "Remedy", "Vital"],
        "roots": ["Bridge", "Path", "Sphere", "Works", "Core", "Point", "Link", "Wave", "Trust", "Grid"],
    },
    "Finance": {
        "prefixes": ["Trade", "Capital", "Ledger", "Fiscal", "Bankwell", "Assetly", "Equity", "Vault", "Fund", "Coin"],
        "roots": ["Flow", "Bridge", "Peak", "Metrics", "Guard", "Point", "Works", "Chain", "Trust", "Core"],
    },
    "Logistics": {
        "prefixes": ["Freight", "Cargo", "Transit", "Routewise", "Shipwell", "Fleet", "Portside", "Dispatch", "Haul", "Trans"],
        "roots": ["Flow", "Link", "Track", "Grid", "Route", "Works", "Bridge", "Chain", "Path", "Node"],
    },
    "Retail": {
        "prefixes": ["Retail", "Shopfront", "Marketly", "Storefront", "Trendline", "Cartwell", "Buywise", "Merchant", "Vend", "Basket"],
        "roots": ["Edge", "Point", "Metrics", "Hub", "Works", "Grid", "Path", "Bridge", "Wave", "Loop"],
    },
    "Manufacturing": {
        "prefixes": ["Forge", "Ironclad", "Precision", "Buildwell", "Factory", "Metalworks", "Assembly", "Toolcraft", "Foundry", "Machine"],
        "roots": ["Works", "Dynamics", "Systems", "Grid", "Core", "Point", "Bridge", "Flow", "Craft", "Line"],
    },
    "SUFFIXES": ["Analytics", "Systems", "Solutions", "Technologies", "Group", "Partners", "Networks", "Dynamics"],
}


def _generate_tier3(rng, count=50):
    industries = ["Healthcare", "Finance", "Logistics", "Retail", "Manufacturing"]
    per_industry = count // len(industries)
    companies = []
    used_names = set()
    for industry in industries:
        pool = TIER3_INDUSTRIES[industry]
        generated_for_industry = 0
        attempts = 0
        while generated_for_industry < per_industry and attempts < 500:
            attempts += 1
            prefix = rng.choice(pool["prefixes"])
            root = rng.choice(pool["roots"])
            suffix = rng.choice(TIER3_INDUSTRIES["SUFFIXES"])
            name = f"{prefix}{root} {suffix}"
            if name in used_names:
                continue
            used_names.add(name)
            companies.append((name, industry))
            generated_for_industry += 1
    return companies


# ------------------------------------------------------------------
# Health-behavior personas.
# Deliberately independent of tier/company size — persona is chosen
# per-client from the same distribution regardless of which tier the
# company belongs to, so account size cannot act as a health proxy.
# ------------------------------------------------------------------
PERSONAS = [
    # name, weight, (feature_count_min, feature_count_max), (depth_min, depth_max), (reach_min, reach_max)
    ("power_user",        0.15, (7, 8), (75, 98), (70, 95)),
    ("efficient_focused", 0.15, (4, 6), (80, 98), (75, 95)),
    ("champion_small",    0.10, (2, 4), (80, 99), (55, 85)),
    ("broad_shallow",     0.15, (6, 8), (25, 50), (35, 60)),
    ("steady_average",    0.15, (3, 6), (45, 70), (40, 65)),
    ("engaged_growing",   0.10, (5, 7), (60, 85), (55, 80)),
    ("declining",         0.08, (3, 6), (20, 45), (10, 30)),
    ("at_risk",           0.07, (1, 3), (10, 35), (5, 30)),
    ("churning",          0.05, (0, 1), (5, 15), (5, 15)),
]


def _status_for_score(score):
    if score >= 75:
        return "healthy"
    if score >= 40:
        return "watch"
    return "at_risk"


def _pick_persona(rng):
    names = [p[0] for p in PERSONAS]
    weights = [p[1] for p in PERSONAS]
    chosen = rng.choices(names, weights=weights, k=1)[0]
    return next(p for p in PERSONAS if p[0] == chosen)


def generate_clients(seed=SEED):
    """Return a list of client profile dicts, fully independent of tier for scoring."""
    rng = random.Random(seed)

    roster = []
    for name, industry in TIER1:
        roster.append((name, "fictional", industry))
    for name, industry in TIER2:
        roster.append((name, "enterprise", industry))
    for name, industry in _generate_tier3(rng, 50):
        roster.append((name, "generated", industry))

    rng.shuffle(roster)  # order clients independent of tier grouping

    profiles = []
    for name, tier, industry in roster:
        _, _, (fc_min, fc_max), (depth_min, depth_max), (reach_min, reach_max) = _pick_persona(rng)

        feature_count = rng.randint(fc_min, fc_max)
        adopted_features = rng.sample(FEATURES, feature_count)

        feature_records = []
        depth_scores = []
        for feature in FEATURES:
            is_adopted = feature in adopted_features
            if is_adopted:
                adoption_score = rng.randint(depth_min, depth_max)
                days_ago = rng.randint(0, 6) if adoption_score >= 60 else rng.randint(7, 45)
                depth_scores.append(adoption_score)
            else:
                adoption_score = 0
                days_ago = None
            feature_records.append({
                "feature_name": feature,
                "is_adopted": is_adopted,
                "adoption_score": adoption_score,
                "days_since_last_used": days_ago,
            })

        breadth_score = round((feature_count / len(FEATURES)) * 100)
        depth_score = round(sum(depth_scores) / len(depth_scores)) if depth_scores else 0
        reach_score = rng.randint(reach_min, reach_max)

        health_score = round(0.30 * breadth_score + 0.40 * depth_score + 0.30 * reach_score)
        health_score = max(0, min(100, health_score))

        profiles.append({
            "name": name,
            "tier": tier,
            "industry": industry,
            "health_score": health_score,
            "health_status": _status_for_score(health_score),
            "usage_breadth_score": breadth_score,
            "usage_depth_score": depth_score,
            "user_reach_score": reach_score,
            "features": feature_records,
        })

    return profiles


if __name__ == "__main__":
    profiles = generate_clients()
    print(f"Generated {len(profiles)} client profiles")
    by_tier = {}
    for p in profiles:
        by_tier.setdefault(p["tier"], []).append(p["health_score"])
    for tier, scores in by_tier.items():
        avg = sum(scores) / len(scores)
        print(f"  {tier}: n={len(scores)} avg_health_score={avg:.1f}")
