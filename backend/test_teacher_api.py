import requests
import json

BASE_URL = "https://school-management-project-qpox.onrender.com"


def create_teacher():
    """Test creating a teacher via API"""

    teacher_data = {
        "user_email": "newteacher006508@example.com",  # Also change this
        "user_first_name": "Python",
        "user_last_name": "Request",
        "employee_id": "EMP0098708",  # Change this to a unique ID
        "staff_type": "teaching",
        "level": "junior_secondary",
        "qualification": "B.A Education",
    }

    response = requests.post(
        f"{BASE_URL}/api/teachers/teachers/",
        json=teacher_data,
        headers={"Content-Type": "application/json"},
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        print("\n✅ Teacher created successfully!")
        result = response.json()
        print(f"Teacher ID: {result['id']}")
        print(f"Username: {result['user']['username']}")
        print(f"Generated Password: {result.get('user_password', 'N/A')}")
    else:
        print("\n❌ Failed to create teacher")


def list_teachers():
    """List all teachers"""

    response = requests.get(
        f"{BASE_URL}/api/teachers/teachers/",
        headers={"Content-Type": "application/json"},
    )

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list):
            print(f"Found {len(data)} teachers:")
            for teacher in data[:5]:  # Show first 5
                print(
                    f"  - {teacher.get('full_name', 'N/A')} ({teacher.get('employee_id', 'N/A')})"
                )
        else:
            print(json.dumps(data, indent=2))
    elif response.status_code == 401:
        print("⚠️ Authentication required to list teachers")
    else:
        print(f"Error: {response.json()}")


if __name__ == "__main__":
    print("=" * 50)
    print("CREATING TEACHER")
    print("=" * 50)
    create_teacher()

    print("\n" + "=" * 50)
    print("LISTING TEACHERS")
    print("=" * 50)
    list_teachers()
