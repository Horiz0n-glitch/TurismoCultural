"""Enable r2.dev public access on Cloudflare R2 bucket via API.
NOTE: This script requires a Cloudflare API token with R2 permissions.
Set CF_API_TOKEN env var or in .env"""
import os, json, sys, urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env
env_path = BASE_DIR / '.env'
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip()

ACCOUNT = os.environ.get('R2_ACCOUNT_ID')
TOKEN = os.environ.get('CF_API_TOKEN')

if not TOKEN:
    print("Set CF_API_TOKEN in .env to use this script")
    print("Or enable public access via Cloudflare Dashboard:")
    print("R2 -> turismocultural -> Settings -> Public Access -> r2.dev")
    sys.exit(1)

# Check bucket
req = urllib.request.Request(
    f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/r2/buckets/turismocultural',
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
print(f"Bucket: {data['result']['name']}")
print(f"Location: {data['result']['location']}")
