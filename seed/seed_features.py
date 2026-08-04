"""
Seed the `feature_adoption` table — one row per client per feature (8 x 100
= 800 rows), using the same profiles seed_clients.py generated so adoption
data lines up with each client's usage_breadth/usage_depth scores.

Run this AFTER seed_clients.py (it reads seed/_generated/clients_seed.json
for the real client_id values Supabase assigned).

Usage:
    python seed/seed_features.py
"""
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from _supabase_client import get_client

GENERATED_FILE = Path(__file__).parent / "_generated" / "clients_seed.json"
BATCH_SIZE = 200


def main():
    if not GENERATED_FILE.exists():
        print(f"ERROR: {GENERATED_FILE} not found. Run seed_clients.py first.", file=sys.stderr)
        sys.exit(1)

    with open(GENERATED_FILE) as f:
        clients = json.load(f)

    client = get_client()

    print("Clearing existing rows from feature_adoption...")
    client.table("feature_adoption").delete().neq("id", 0).execute()

    now = datetime.now(timezone.utc)
    rows = []
    for c in clients:
        for feat in c["features"]:
            last_used = None
            if feat["is_adopted"] and feat["days_since_last_used"] is not None:
                last_used = (now - timedelta(days=feat["days_since_last_used"])).isoformat()
            rows.append({
                "client_id": c["client_id"],
                "feature_name": feat["feature_name"],
                "is_adopted": feat["is_adopted"],
                "adoption_score": feat["adoption_score"],
                "last_used": last_used,
            })

    print(f"Inserting {len(rows)} feature_adoption rows...")
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        client.table("feature_adoption").insert(batch).execute()
        print(f"  inserted {i + len(batch)}/{len(rows)} rows")

    print("Done seeding feature adoption.")


if __name__ == "__main__":
    main()
