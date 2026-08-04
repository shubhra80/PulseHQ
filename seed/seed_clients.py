"""
Seed the `clients` table with 100 fictional clients (15 fictional + 35
enterprise + 50 generated) and write seed/_generated/clients_seed.json so
seed_features.py can insert matching feature_adoption rows against the
real client_id values Supabase assigns.

Usage:
    python seed/seed_clients.py
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from _supabase_client import get_client
from data_gen import generate_clients

GENERATED_DIR = Path(__file__).parent / "_generated"
GENERATED_FILE = GENERATED_DIR / "clients_seed.json"

BATCH_SIZE = 25


def main():
    client = get_client()
    profiles = generate_clients()
    print(f"Generated {len(profiles)} client profiles.")

    print("Clearing existing rows from clients (cascades to feature_adoption)...")
    client.table("clients").delete().neq("id", 0).execute()

    rows = [
        {
            "name": p["name"],
            "tier": p["tier"],
            "industry": p["industry"],
            "health_score": p["health_score"],
            "health_status": p["health_status"],
            "usage_breadth_score": p["usage_breadth_score"],
            "usage_depth_score": p["usage_depth_score"],
            "user_reach_score": p["user_reach_score"],
        }
        for p in profiles
    ]

    name_to_id = {}
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        result = client.table("clients").insert(batch).execute()
        for record in result.data:
            name_to_id[record["name"]] = record["id"]
        print(f"  inserted {i + len(batch)}/{len(rows)} clients")

    GENERATED_DIR.mkdir(exist_ok=True)
    export = []
    for p in profiles:
        export.append({
            "client_id": name_to_id[p["name"]],
            "name": p["name"],
            "features": p["features"],
        })
    with open(GENERATED_FILE, "w") as f:
        json.dump(export, f, indent=2)

    print(f"Wrote {GENERATED_FILE} for seed_features.py")
    print("Done seeding clients.")


if __name__ == "__main__":
    main()
