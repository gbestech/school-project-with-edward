import requests
import json

BASE_URL = "https://school-management-project-qpox.onrender.com"
ADMIN_USERNAME = "ADM/GTS/OCT/25/003"
ADMIN_PASSWORD = "3u#97ypUGt37"

print("=" * 70)
print("TOKEN FORMAT DEBUG TEST")
print("=" * 70)

# Step 1: Login and capture full response
print("\n1. Logging in...")
response = requests.post(
    f"{BASE_URL}/api/auth/login/",
    json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
    headers={"Content-Type": "application/json"},
)

if response.status_code != 200:
    print(f"❌ Login failed: {response.status_code}")
    print(response.text)
    exit(1)

login_data = response.json()
print("\n✅ Login successful!")
print("\n📋 Full login response:")
print(json.dumps(login_data, indent=2))

# Extract all possible tokens
access_token = login_data.get("access")
refresh_token = login_data.get("refresh")
token = login_data.get("token")
key = login_data.get("key")

print("\n🔑 Token fields found:")
if access_token:
    print(f"  - access: {access_token[:50]}...")
if refresh_token:
    print(f"  - refresh: {refresh_token[:50]}...")
if token:
    print(f"  - token: {token[:50]}...")
if key:
    print(f"  - key: {key[:50]}...")

# Step 2: Test different authentication header formats
print("\n" + "=" * 70)
print("2. Testing different authentication formats...")
print("=" * 70)

test_tokens = []
if access_token:
    test_tokens.append(("Bearer", access_token, "JWT access token with Bearer"))
if token:
    test_tokens.append(("Token", token, "DRF token with Token prefix"))
if key:
    test_tokens.append(("Token", key, "DRF key with Token prefix"))
if access_token:
    test_tokens.append(("Token", access_token, "JWT access token with Token prefix"))

for prefix, token_value, description in test_tokens:
    print(f"\n🧪 Testing: {description}")
    print(f"   Header: Authorization: {prefix} {token_value[:30]}...")

    response = requests.get(
        f"{BASE_URL}/api/teachers/teachers/",
        headers={"Authorization": f"{prefix} {token_value}"},
    )

    print(f"   Status: {response.status_code}", end="")

    if response.status_code == 200:
        print(" ✅ SUCCESS!")
        data = response.json()
        if isinstance(data, list):
            print(f"   Found {len(data)} teachers")
        print(
            f"\n🎉 WORKING AUTH FORMAT: Authorization: {prefix} {token_value[:30]}..."
        )
        break
    elif response.status_code == 401:
        print(" ❌ Unauthorized")
        try:
            print(f"   Error: {response.json()}")
        except:
            pass
    elif response.status_code == 403:
        print(" ⚠️ Forbidden (authenticated but no permission)")
        break
    else:
        print(f" ⚠️ Unexpected: {response.status_code}")

print("\n" + "=" * 70)
print("TEST COMPLETED")
print("=" * 70)
