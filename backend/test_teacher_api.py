import requests
import json

BASE_URL = "https://school-management-project-qpox.onrender.com"

# ============================================
# AUTHENTICATION CREDENTIALS
# Replace these with actual admin credentials
# ============================================
ADMIN_USERNAME = "your_admin_username"  # Change this
ADMIN_PASSWORD = "your_admin_password"  # Change this


def get_auth_token():
    """Login and get authentication token"""
    print("Attempting to login...")

    login_data = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD,
    }

    # Try token-based authentication endpoint
    response = requests.post(
        f"{BASE_URL}/api/auth/login/",  # Adjust endpoint if different
        json=login_data,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        result = response.json()
        token = result.get("token") or result.get("key") or result.get("auth_token")
        if token:
            print(f"✅ Login successful! Token obtained.")
            return token
        else:
            print(f"⚠️ Login successful but no token found in response")
            print(f"Response: {json.dumps(result, indent=2)}")
            return None
    else:
        print(f"❌ Login failed with status {response.status_code}")
        try:
            print(f"Error: {response.json()}")
        except:
            print(f"Error: {response.text}")
        return None


def create_teacher(token=None):
    """Test creating a teacher via API"""

    teacher_data = {
        "user_email": "newteachersunday@example.com",
        "user_first_name": "Python",
        "user_last_name": "Request",
        "employee_id": "EMP0098792",
        "staff_type": "teaching",
        "level": "junior_secondary",
        "qualification": "B.A Education",
    }

    headers = {"Content-Type": "application/json"}

    # Add authentication header if token is provided
    if token:
        headers["Authorization"] = f"Token {token}"

    response = requests.post(
        f"{BASE_URL}/api/teachers/teachers/",
        json=teacher_data,
        headers=headers,
    )

    print(f"Status Code: {response.status_code}")

    try:
        response_data = response.json()
        print(f"Response: {json.dumps(response_data, indent=2)}")

        if response.status_code == 201:
            print("\n✅ Teacher created successfully!")
            print(f"Teacher ID: {response_data['id']}")
            print(f"Username: {response_data['user']['username']}")
            print(f"Generated Password: {response_data.get('user_password', 'N/A')}")
            return response_data
        elif response.status_code == 401:
            print("\n❌ Authentication required or invalid token")
        elif response.status_code == 403:
            print(
                "\n❌ Permission denied - User doesn't have 'write' permission on teachers module"
            )
        else:
            print("\n❌ Failed to create teacher")
    except Exception as e:
        print(f"Error parsing response: {e}")
        print(f"Raw response: {response.text}")

    return None


def list_teachers(token=None):
    """List all teachers"""

    headers = {"Content-Type": "application/json"}

    # Add authentication header if token is provided
    if token:
        headers["Authorization"] = f"Token {token}"

    response = requests.get(
        f"{BASE_URL}/api/teachers/teachers/",
        headers=headers,
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Found {len(data)} teachers:")
                for teacher in data[:5]:  # Show first 5
                    print(
                        f"  - {teacher.get('full_name', 'N/A')} ({teacher.get('employee_id', 'N/A')})"
                    )
                if len(data) > 5:
                    print(f"  ... and {len(data) - 5} more")
            else:
                print(json.dumps(data, indent=2))
        except Exception as e:
            print(f"Error parsing response: {e}")
    elif response.status_code == 401:
        print("❌ Authentication required to list teachers")
    elif response.status_code == 403:
        print(
            "❌ Permission denied - User doesn't have 'read' permission on teachers module"
        )
    else:
        try:
            print(f"Error: {response.json()}")
        except:
            print(f"Error: {response.text}")


def test_unauthenticated_access():
    """Test that unauthenticated requests are properly blocked"""
    print("Testing unauthenticated access (should fail)...")

    teacher_data = {
        "user_email": "unauthorized@example.com",
        "user_first_name": "Unauthorized",
        "user_last_name": "User",
        "employee_id": "UNAUTH001",
        "staff_type": "teaching",
        "level": "junior_secondary",
    }

    response = requests.post(
        f"{BASE_URL}/api/teachers/teachers/",
        json=teacher_data,
        headers={"Content-Type": "application/json"},
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code == 401:
        print("✅ Correctly blocked unauthenticated request")
    elif response.status_code == 403:
        print("✅ Correctly blocked unauthorized request")
    else:
        print(f"⚠️ Unexpected status code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")


if __name__ == "__main__":
    print("=" * 60)
    print("TEACHER API TEST WITH AUTHENTICATION")
    print("=" * 60)

    # Step 1: Login and get token
    print("\n" + "=" * 60)
    print("STEP 1: AUTHENTICATION")
    print("=" * 60)
    token = get_auth_token()

    if not token:
        print("\n⚠️ Could not obtain authentication token.")
        print("Please check your credentials and login endpoint.")
        print("\nTesting unauthenticated access anyway...")

        print("\n" + "=" * 60)
        print("STEP 2: TEST UNAUTHENTICATED ACCESS")
        print("=" * 60)
        test_unauthenticated_access()

        print("\n" + "=" * 60)
        print("STEP 3: TRY LISTING WITHOUT AUTH")
        print("=" * 60)
        list_teachers()

        exit(1)

    # Step 2: Test unauthenticated access (should fail)
    print("\n" + "=" * 60)
    print("STEP 2: TEST UNAUTHENTICATED ACCESS")
    print("=" * 60)
    test_unauthenticated_access()

    # Step 3: Create teacher with authentication
    print("\n" + "=" * 60)
    print("STEP 3: CREATE TEACHER (WITH AUTH)")
    print("=" * 60)
    created_teacher = create_teacher(token)

    # Step 4: List teachers with authentication
    print("\n" + "=" * 60)
    print("STEP 4: LIST TEACHERS (WITH AUTH)")
    print("=" * 60)
    list_teachers(token)

    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60)
