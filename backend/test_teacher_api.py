import requests
import json

BASE_URL = (
    "https://school-management-project-qpox.onrender.com"  # Remove /api from here
)


def create_teacher():
    """Test creating a teacher via API"""

    teacher_data = {
        "user_email": "pythontest@example.com",
        "user_first_name": "Python",
        "user_last_name": "Request",
        "employee_id": "EMP0034",
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
        print(f"Generated Password: {result['user_password']}")
    else:
        print("\n❌ Failed to create teacher")
        print(f"Errors: {response.json()}")


def list_teachers(token=None):
    """List all teachers (requires authentication)"""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Token {token}"
    response = requests.get(f"{BASE_URL}/api/teachers/teachers/", headers=headers)

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        teachers = response.json()
        if isinstance(teachers, list):
            print(f"Found {len(teachers)} teachers:")
            for teacher in teachers:
                print(f"  - {teacher['full_name']} ({teacher['employee_id']})")
        else:
            print(f"Response: {json.dumps(teachers, indent=2)}")
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
