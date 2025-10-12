import requests
import json
import time

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
        return None

    data = response.json()
    access_token = data.get("access")
    print(f"✅ Logged in as {data['user']['first_name']} {data['user']['last_name']}")
    return access_token


def get_teacher_by_id(token, teacher_id):
    """Fetch a specific teacher by ID"""
    print(f"\n🔍 Fetching teacher ID {teacher_id}...")
    response = requests.get(
        f"{BASE_URL}/api/teachers/teachers/{teacher_id}/",
        headers={"Authorization": f"Bearer {token}"},
    )

    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(
            f"   ✅ Found: {data.get('full_name')} (Employee ID: {data.get('employee_id')})"
        )
        return data
    else:
        print(f"   ❌ Error: {response.status_code}")
        try:
            print(f"   Details: {response.json()}")
        except:
            pass
    return None


def list_all_teachers(token):
    """List all teachers with full details"""
    print(f"\n📋 Fetching all teachers...")
    response = requests.get(
        f"{BASE_URL}/api/teachers/teachers/",
        headers={"Authorization": f"Bearer {token}"},
    )

    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        teachers = data if isinstance(data, list) else data.get("results", [])
        print(f"   ✅ Found {len(teachers)} teacher(s)")
        if teachers:
            print("\n   Teachers in database:")
            for t in teachers:
                print(
                    f"      - ID: {t.get('id')}, Name: {t.get('full_name')}, EmpID: {t.get('employee_id')}"
                )
        return teachers
    else:
        print(f"   ❌ Error: {response.status_code}")
    return []


def check_user_exists(token, username):
    """Check if a user exists in the system"""
    print(f"\n👤 Checking if user '{username}' exists...")
    response = requests.get(
        f"{BASE_URL}/api/auth/users/",
        headers={"Authorization": f"Bearer {token}"},
    )

    if response.status_code == 200:
        data = response.json()
        users = data if isinstance(data, list) else data.get("results", [])
        for user in users:
            if user.get("username") == username:
                print(
                    f"   ✅ User found! ID: {user.get('id')}, Email: {user.get('email')}"
                )
                return user
        print(f"   ❌ User not found in system")
        return None
    else:
        print(f"   ⚠️  Cannot check users (Status: {response.status_code})")
    return None


def diagnose():
    """Run full diagnostics"""
    print("=" * 70)
    print("TEACHER DATA PERSISTENCE DIAGNOSTIC")
    print("=" * 70)

    # Login
    token = login()
    if not token:
        print("\n❌ Cannot proceed without authentication")
        return

    # Scenario 1: Check if previously created teacher (ID 13) exists
    print("\n" + "=" * 70)
    print("SCENARIO 1: Direct Fetch of Previously Created Teacher")
    print("=" * 70)
    teacher = get_teacher_by_id(token, 13)

    # Scenario 2: List all teachers
    print("\n" + "=" * 70)
    print("SCENARIO 2: List All Teachers")
    print("=" * 70)
    all_teachers = list_all_teachers(token)

    # Scenario 3: Check if the teacher's user account exists
    if teacher:
        username = teacher.get("user", {}).get("username")
        print("\n" + "=" * 70)
        print("SCENARIO 3: Check User Account")
        print("=" * 70)
        check_user_exists(token, username)

    # Scenario 4: Create a new teacher and immediately check various ways
    print("\n" + "=" * 70)
    print("SCENARIO 4: Create New Teacher & Check Persistence")
    print("=" * 70)

    import random

    random_id = random.randint(1000, 9999)
    teacher_data = {
        "user_email": f"teacher{random_id}@example.com",
        "user_first_name": "Diagnostic",
        "user_last_name": f"Test{random_id}",
        "employee_id": f"DIAG{random_id}",
        "staff_type": "teaching",
        "level": "junior_secondary",
        "qualification": "B.A Education",
    }

    print(f"\n📝 Creating teacher with Employee ID: {teacher_data['employee_id']}")
    response = requests.post(
        f"{BASE_URL}/api/teachers/teachers/",
        json=teacher_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    if response.status_code == 201:
        created = response.json()
        new_teacher_id = created.get("id")
        new_teacher_username = created.get("user", {}).get("username")
        print(f"✅ Teacher created! ID: {new_teacher_id}")

        # Check 1: Immediate direct fetch
        print("\n   ⏱️  Immediate check (direct fetch by ID):")
        get_teacher_by_id(token, new_teacher_id)

        # Check 2: Immediate list
        print("\n   ⏱️  Immediate check (list all):")
        teachers = list_all_teachers(token)

        # Check 3: Wait and retry
        print("\n   ⏱️  Waiting 2 seconds...")
        time.sleep(2)
        print("   ⏱️  After delay check (list all):")
        teachers_after = list_all_teachers(token)

        # Check 4: Search by employee ID
        print(
            f"\n   🔎 Searching in list for Employee ID: {teacher_data['employee_id']}"
        )
        found = any(
            t.get("employee_id") == teacher_data["employee_id"] for t in teachers_after
        )
        if found:
            print(f"      ✅ Found in list after delay!")
        else:
            print(f"      ❌ NOT found in list even after delay")

        # Check 5: Verify user exists
        print(f"\n   👤 Checking if user account exists:")
        check_user_exists(token, new_teacher_username)

    else:
        print(f"❌ Failed to create teacher: {response.status_code}")
        print(json.dumps(response.json(), indent=2))

    print("\n" + "=" * 70)
    print("DIAGNOSTIC COMPLETE")
    print("=" * 70)
    print("\n📊 POSSIBLE ISSUES:")
    print("   1. ❌ Direct fetch works but list returns empty?")
    print("      → Endpoint has different permissions or filtering")
    print("   2. ❌ Direct fetch returns 404?")
    print("      → Teacher not actually saved to database")
    print("   3. ❌ Found after delay but not immediately?")
    print("      → Caching or async database issue (Render free tier?)")
    print("   4. ❌ User account doesn't exist?")
    print("      → User creation failed silently")


if __name__ == "__main__":
    diagnose()
