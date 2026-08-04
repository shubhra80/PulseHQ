import os
import sys

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


def get_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")
    if not url or not key:
        print("ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set (in .env or the environment).", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)
