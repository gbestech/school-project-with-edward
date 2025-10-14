import requests
import json
from datetime import datetime

BASE_URL = "https://school-management-project-qpox.onrender.com/api"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYwNDI1NDY0LCJpYXQiOjE3NjA0MjE4NjQsImp0aSI6IjBhNDAzMTBhODYwZTQ2NTg4ZjA0MDUxMmYzOGQyODUwIiwidXNlcl9pZCI6MjQsImlkIjoyNCwiZW1haWwiOiJyZWJlY2NhLmF3YW5hQGdvZHN0cmVhc3VyZXNjaG9vbHMuY29tIiwicm9sZSI6ImFkbWluIiwiaXNfc3RhZmYiOnRydWV9.I_RyE9KZqbqxJHesawBrAP-jFnew7ee3mZOQH10roT8"

headers = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}

print("=" * 70)
print("DJANGO BACKEND STREAM VALIDATION TEST")
print("=" * 70)
print(f"Server: {BASE_URL}")
print(f"Testing: Can we create SS classrooms without stream?")
print("=" * 70)

# Step 1: Check connection
print("\n📡 Step 1: Testing connection...")
try:
    response = requests.get(f"{BASE_URL}/classrooms/", headers=headers, timeout=10)
    print(f"✅ Connected! Status: {response.status_code}")

    if response.status_code == 401:
        print("❌ Token expired or invalid")
        print("👉 Get a new token and update the script")
        exit(1)
    elif response.status_code == 200:
        data = response.json()
        print(f"✅ Found {len(data)} existing classrooms")

except requests.exceptions.RequestException as e:
    print(f"❌ Connection failed: {e}")
    print("👉 Check if Render server is running")
    exit(1)

# Step 2: Get streams
print("\n📚 Step 2: Getting available streams...")
try:
    streams_response = requests.get(f"{BASE_URL}/streams/", headers=headers, timeout=10)
    if streams_response.status_code == 200:
        streams = streams_response.json()
        print(f"✅ Found {len(streams)} streams:")
        for stream in streams:
            print(
                f"   • ID: {stream['id']}, Name: {stream['name']}, Type: {stream['stream_type']}"
            )
    else:
        print(f"⚠️  Could not get streams (status: {streams_response.status_code})")
        streams = []
except Exception as e:
    print(f"⚠️  Error getting streams: {e}")
    streams = []

# Step 3: TEST - Create classroom WITHOUT stream
print("\n" + "=" * 70)
print("🧪 TEST: Creating SS1 Classroom WITHOUT Stream")
print("=" * 70)

test_data = {
    "name": "SS 1 Test (No Stream)",
    "section": 34,  # SSS 1 Section A
    "academic_session": 3,  # 2025/2026
    "term": 2,  # First Term
    "room_number": "Test Room",
    "max_capacity": 40,
    # ⚠️ NO stream field!
}

print(f"\n📤 Sending request...")
print(f"Data: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(
        f"{BASE_URL}/classrooms/", json=test_data, headers=headers, timeout=15
    )

    print(f"\n📥 Response Status: {response.status_code}")

    # Parse response
    try:
        response_data = response.json()
        print(f"Response Data: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text[:500]}")
        response_data = {}

    # Analyze result
    print("\n" + "=" * 70)
    print("📊 RESULT ANALYSIS")
    print("=" * 70)

    if response.status_code == 201:
        print("✅ SUCCESS! Classroom created WITHOUT stream")
        print("\n🎯 CONCLUSION:")
        print("   • Backend ALLOWS classrooms without stream")
        print("   • Your model is working correctly")
        print("   • The restriction must be in FRONTEND code")
        print("\n👉 RECOMMENDATION:")
        print("   1. Check your frontend form validation")
        print("   2. Look for 'required' attribute on stream field")
        print("   3. Check JavaScript validation rules")
        print("   4. Students should have streams, not classrooms")

        # Offer cleanup
        classroom_id = response_data.get("id")
        if classroom_id:
            print(f"\n🗑️  Created test classroom ID: {classroom_id}")
            cleanup = input("Delete test classroom? (y/n): ").strip().lower()
            if cleanup == "y":
                del_response = requests.delete(
                    f"{BASE_URL}/classrooms/{classroom_id}/",
                    headers=headers,
                    timeout=10,
                )
                if del_response.status_code in [200, 204]:
                    print("✅ Test classroom deleted")
                else:
                    print(f"⚠️  Delete failed (status: {del_response.status_code})")

    elif response.status_code == 400:
        print("❌ VALIDATION ERROR - Backend rejected the request")

        # Check if it's about stream
        error_str = str(response_data).lower()
        if "stream" in error_str:
            print("\n🎯 CONCLUSION:")
            print("   • Backend REQUIRES stream field")
            print("   • This is a BACKEND validation issue")
            print("\n👉 FIXES NEEDED:")
            print("   1. Update ClassroomSerializer to make stream optional")
            print("   2. Remove stream from required fields")
            print("   3. Add validation only during student enrollment")

            print("\n📝 Specific Error:")
            if "stream" in response_data:
                print(f"   Stream Error: {response_data['stream']}")
        else:
            print("\n❓ Different validation error:")
            print(f"   {response_data}")

    elif response.status_code == 401:
        print("❌ AUTHENTICATION ERROR - Token expired")
        print("\n👉 ACTION REQUIRED:")
        print("   1. Login to get a new token")
        print("   2. Update TOKEN variable in this script")

    elif response.status_code == 403:
        print("❌ PERMISSION DENIED")
        print("\n👉 Check if your user has permission to create classrooms")

    elif response.status_code == 500:
        print("❌ SERVER ERROR")
        print("\n👉 Check Django logs on Render for details")

    else:
        print(f"❓ UNEXPECTED STATUS: {response.status_code}")
        print(f"Response: {response_data}")

except requests.exceptions.Timeout:
    print("❌ REQUEST TIMEOUT")
    print("👉 Render server might be slow or sleeping (free tier)")
    print("   Try again in a few seconds")

except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {e}")
    import traceback

    traceback.print_exc()

# Step 4: If streams exist, test creating with different streams
if streams and len(streams) >= 2:
    print("\n" + "=" * 70)
    print("🧪 BONUS TEST: Can we create multiple streams in same section?")
    print("=" * 70)

    test_multiple = input("\nRun this test? (y/n): ").strip().lower()

    if test_multiple == "y":
        created_ids = []

        for i, stream in enumerate(streams[:2]):  # Test with first 2 streams
            print(f"\n📤 Creating SS2 with {stream['name']} stream...")

            data = {
                "name": f"SS 2 {stream['name']} (Test)",
                "section": 37,  # Same section
                "academic_session": 3,  # Same session
                "term": 2,  # Same term
                "stream": stream["id"],  # Different stream
                "room_number": f"Test {stream['name']}",
                "max_capacity": 40,
            }

            response = requests.post(
                f"{BASE_URL}/classrooms/", json=data, headers=headers, timeout=15
            )

            print(f"Status: {response.status_code}")

            if response.status_code == 201:
                classroom_id = response.json().get("id")
                created_ids.append(classroom_id)
                print(f"✅ Created classroom {classroom_id}")
            elif response.status_code == 400:
                print(f"❌ Failed: {response.json()}")
                if "unique" in str(response.json()).lower():
                    print("\n🎯 CONCLUSION:")
                    print(
                        "   • Cannot create multiple classrooms with different streams"
                    )
                    print("   • This confirms you need the migration fix")
                break

        # Cleanup
        if created_ids:
            cleanup = (
                input(f"\nDelete {len(created_ids)} test classrooms? (y/n): ")
                .strip()
                .lower()
            )
            if cleanup == "y":
                for classroom_id in created_ids:
                    requests.delete(
                        f"{BASE_URL}/classrooms/{classroom_id}/", headers=headers
                    )
                print("✅ Cleaned up test classrooms")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
