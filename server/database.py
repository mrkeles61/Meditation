import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

_server_dir = Path(__file__).resolve().parent
_project_root = _server_dir.parent

load_dotenv(_server_dir / ".env")
load_dotenv(_project_root / ".env.local", override=False)

SUPABASE_URL = os.getenv("SUPABASE_URL", "") or os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "") or os.getenv("VITE_SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
