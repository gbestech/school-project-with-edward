import requests
import json
import random

BASE_URL = "https://school-management-project-qpox.onrender.com"
ADMIN_USERNAME = "ADM/GTS/OCT/25/003"
ADMIN_PASSWORD = "3u#97ypUGt37"


def login():
    """Login and get JWT access token"""
    print("🔐 Logging in...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login/",
        json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
    )

    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(response.json())
        return None

    data = response.json()
    access_token = data.get("access")
    print(f"✅ Login successful!")
    print(f"   User: {data['user']['first_name']} {data['user']['last_name']}")
    print(f"   Role: {data['user']['role']}")
    print(f"   Is staff: {data['user']['is_staff']}")
    return access_token


def create_teacher(token):
    """Create a new teacher"""
    # Generate unique IDs
    random_id = random.randint(1000, 9999)

    teacher_data = {
        "user_email": f"teacher{random_id}@example.com",
        "user_first_name": "Test",
        "user_last_name": f"Teacher{random_id}",
        "employee_id": f"EMP{random_id}",
        "staff_type": "teaching",
        "level": "junior_secondary",
        "qualification": "B.A Education",
    }

    print(f"\n📝 Creating teacher...")
    print(f"   Email: {teacher_data['user_email']}")
    print(
        f"   Name: {teacher_data['user_first_name']} {teacher_data['user_last_name']}"
    )
    print(f"   Employee ID: {teacher_data['employee_id']}")

    response = requests.post(
        f"{BASE_URL}/api/teachers/teachers/",
        json=teacher_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    print(f"\n📊 Status Code: {response.status_code}")

    if response.status_code == 201:
        data = response.json()
        print("✅ Teacher created successfully!")
        print(f"\n👤 Teacher Details:")
        print(f"   ID: {data['id']}")
        print(f"   Name: {data['full_name']}")
        print(f"   Username: {data['user']['username']}")
        print(f"   Email: {data['email_readonly']}")
        print(f"   Employee ID: {data['employee_id']}")

        if "user_password" in data:
            print(f"\n🔑 Generated Credentials:")
            print(f"   Username: {data['user']['username']}")
            print(f"   Password: {data['user_password']}")
            print(f"   ⚠️  Save these credentials - they won't be shown again!")

        return data
    elif response.status_code == 403:
        print("❌ Permission denied!")
        print("   Your user doesn't have 'write' permission on the 'teachers' module")
        print("\n💡 To fix this:")
        print("   1. Go to Django Admin")
        print("   2. Assign a role with 'teachers' write permission to your user")
        try:
            print(f"\n   Error details: {response.json()}")
        except:
            pass
    elif response.status_code == 401:
        print("❌ Authentication failed!")
        try:
            print(f"   Error: {response.json()}")
        except:
            pass
    else:
        print(f"❌ Failed to create teacher")
        try:
            error_data = response.json()
            print(f"\n📋 Response:")
            print(json.dumps(error_data, indent=2))
        except:
            print(f"   Raw response: {response.text[:500]}")

    return None


def list_teachers(token, verbose=False):
    """List all teachers"""
    print(f"\n📋 Listing teachers...")

    response = requests.get(
        f"{BASE_URL}/api/teachers/teachers/",
        headers={"Authorization": f"Bearer {token}"},
    )

    print(f"📊 Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()

        # DEBUG: Show raw response structure
        if verbose:
            print("\n🔍 DEBUG - Raw Response:")
            print(json.dumps(data, indent=2)[:500])

        # Handle both list and paginated responses
        if isinstance(data, list):
            teachers = data
        elif isinstance(data, dict):
            # Paginated response - could be {"results": [...]} or {"count": x, "results": [...]}
            if "results" in data:
                teachers = data["results"]
                print(f"   (Showing {len(teachers)} of {data.get('count', '?')} total)")
            else:
                print("❌ Unexpected response format!")
                print(json.dumps(data, indent=2))
                return
        else:
            print("❌ Unexpected response format!")
            print(json.dumps(data, indent=2))
            return

        if teachers:
            print(f"✅ Found {len(teachers)} teacher(s)")
            print("\n👥 Teachers:")
            for i, teacher in enumerate(teachers[:10], 1):
                print(
                    f"   {i}. {teacher.get('full_name', 'N/A')} ({teacher.get('employee_id', 'N/A')})"
                )
            if len(teachers) > 10:
                print(f"   ... and {len(teachers) - 10} more")
        else:
            print("✅ No teachers found in database")

    elif response.status_code == 403:
        print("❌ Permission denied!")
        print("   Your user doesn't have 'read' permission on the 'teachers' module")
    elif response.status_code == 401:
        print("❌ Authentication failed!")
        try:
            print(f"   Error: {response.json()}")
        except:
            pass
    else:
        print(f"❌ Failed to list teachers (Status: {response.status_code})")
        try:
            print(f"   Error: {response.json()}")
        except:
            print(f"   Raw response: {response.text[:500]}")


def main():
    print("=" * 70)
    print("TEACHER MANAGEMENT TEST - DEBUGGED")
    print("=" * 70)

    # Step 1: Login
    token = login()
    if not token:
        print("\n❌ Cannot proceed without authentication")
        return

    # Step 2: List existing teachers (with verbose output)
    print("\n" + "=" * 70)
    print("BEFORE: Current Teachers")
    print("=" * 70)
    list_teachers(token, verbose=True)

    # Step 3: Create new teacher
    print("\n" + "=" * 70)
    print("CREATE: New Teacher")
    print("=" * 70)
    teacher = create_teacher(token)

    # Step 4: List teachers again
    if teacher:
        print("\n" + "=" * 70)
        print("AFTER: Updated Teachers List")
        print("=" * 70)
        list_teachers(token)

    print("\n" + "=" * 70)
    print("TEST COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()
