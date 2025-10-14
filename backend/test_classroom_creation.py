import requests
import json

BASE_URL = "http://localhost:8000/api"  # Update if different

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYwNDI1NDY0LCJpYXQiOjE3NjA0MjE4NjQsImp0aSI6IjBhNDAzMTBhODYwZTQ2NTg4ZjA0MDUxMmYzOGQyODUwIiwidXNlcl9pZCI6MjQsImlkIjoyNCwiZW1haWwiOiJyZWJlY2NhLmF3YW5hQGdvZHN0cmVhc3VyZXNjaG9vbHMuY29tIiwicm9sZSI6ImFkbWluIiwiaXNfc3RhZmYiOnRydWV9.I_RyE9KZqbqxJHesawBrAP-jFnew7ee3mZOQH10roT8"

headers = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}


def test_create_classroom_without_stream():
    """Test creating SS classroom without stream"""
    print("=" * 60)
    print("TEST 1: Create SS1 Classroom WITHOUT Stream")
    print("=" * 60)

    data = {
        "name": "SS 1 General (No Stream)",
        "section": 34,  # SSS 1 Section A
        "academic_session": 3,
        "term": 2,
        "room_number": "SS1 General",
        "max_capacity": 40,
    }

    response = requests.post(f"{BASE_URL}/classrooms/", json=data, headers=headers)

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        print("\n✅ SUCCESS! Backend allows classrooms without stream")
        print("👉 The restriction is in your FRONTEND code!")
        return response.json()["id"]  # Return ID for cleanup
    else:
        print("\n❌ Backend is blocking this")
        if "stream" in response.json():
            print("👉 Stream field is required in backend")
        return None


def test_create_multiple_streams_same_section():
    """Test creating multiple classrooms with different streams in same section"""
    print("\n" + "=" * 60)
    print("TEST 2: Create Multiple Streams in Same Section/Session/Term")
    print("=" * 60)

    # First, get available streams
    streams_response = requests.get(f"{BASE_URL}/streams/", headers=headers)
    streams = streams_response.json()

    print("\nAvailable Streams:")
    for stream in streams:
        print(f"  ID: {stream['id']}, Name: {stream['name']}")

    if len(streams) < 2:
        print("\n⚠️  Need at least 2 streams to test this")
        return

    # Try creating with first stream
    data1 = {
        "name": f"SS 2 {streams[0]['name']}",
        "section": 37,  # Same section as existing SS2
        "academic_session": 3,
        "term": 2,
        "stream": streams[0]["id"],
        "room_number": f"SS2 {streams[0]['name']}",
        "max_capacity": 40,
    }

    response1 = requests.post(f"{BASE_URL}/classrooms/", json=data1, headers=headers)
    print(f"\nStream 1 Status: {response1.status_code}")

    if response1.status_code == 201:
        print("✅ First stream classroom created")

        # Try second stream
        data2 = {
            "name": f"SS 2 {streams[1]['name']}",
            "section": 37,  # Same section
            "academic_session": 3,  # Same session
            "term": 2,  # Same term
            "stream": streams[1]["id"],  # Different stream
            "room_number": f"SS2 {streams[1]['name']}",
            "max_capacity": 40,
        }

        response2 = requests.post(
            f"{BASE_URL}/classrooms/", json=data2, headers=headers
        )
        print(f"Stream 2 Status: {response2.status_code}")

        if response2.status_code == 201:
            print("✅ SUCCESS! Can create multiple streams in same section")
            return [response1.json()["id"], response2.json()["id"]]
        elif response2.status_code == 400:
            print("❌ Cannot create second stream - unique constraint issue")
            print(f"Error: {response2.json()}")
            return [response1.json()["id"]]
    else:
        print(f"❌ Failed to create first classroom: {response1.json()}")
        return []


def cleanup_test_classrooms(classroom_ids):
    """Delete test classrooms"""
    if not classroom_ids:
        return

    print("\n" + "=" * 60)
    print("CLEANUP: Deleting Test Classrooms")
    print("=" * 60)

    for classroom_id in classroom_ids:
        if classroom_id:
            response = requests.delete(
                f"{BASE_URL}/classrooms/{classroom_id}/", headers=headers
            )
            if response.status_code in [200, 204]:
                print(f"✅ Deleted classroom {classroom_id}")
            else:
                print(f"⚠️  Could not delete classroom {classroom_id}")


# Run tests
if __name__ == "__main__":
    created_ids = []

    try:
        # Test 1
        id1 = test_create_classroom_without_stream()
        if id1:
            created_ids.append(id1)

        # Test 2
        ids2 = test_create_multiple_streams_same_section()
        if ids2:
            created_ids.extend(ids2)

        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Created {len(created_ids)} test classroom(s)")

    finally:
        # Cleanup
        cleanup_input = input("\nDelete test classrooms? (y/n): ")
        if cleanup_input.lower() == "y":
            cleanup_test_classrooms(created_ids)
