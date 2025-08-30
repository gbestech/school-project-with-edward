#!/usr/bin/env python3
"""
Test script to verify teacher profile edit functionality
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_teacher_profile_edit():
    """Test the complete teacher profile edit flow"""
    
    print("🧪 Testing Teacher Profile Edit Functionality")
    print("=" * 50)
    
    # Step 1: Get teacher profile (ID 19)
    print("\n1️⃣ Getting teacher profile (ID 19)...")
    try:
        response = requests.get(f"{API_BASE}/teachers/teachers/19/")
        if response.status_code == 200:
            teacher_data = response.json()
            print(f"✅ Successfully retrieved teacher profile")
            print(f"   Current bio: {teacher_data.get('bio', 'None')}")
            print(f"   Current date_of_birth: {teacher_data.get('date_of_birth', 'None')}")
        else:
            print(f"❌ Failed to get teacher profile: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting teacher profile: {e}")
        return False
    
    # Step 2: Update teacher profile with new bio and date_of_birth
    print("\n2️⃣ Updating teacher profile...")
    update_data = {
        "bio": f"Updated bio test - {time.time()}",
        "date_of_birth": "1990-01-15"
    }
    
    try:
        response = requests.patch(f"{API_BASE}/teachers/teachers/19/", json=update_data)
        if response.status_code == 200:
            updated_data = response.json()
            print(f"✅ Successfully updated teacher profile")
            print(f"   Updated bio: {updated_data.get('bio', 'None')}")
            print(f"   Updated date_of_birth: {updated_data.get('date_of_birth', 'None')}")
        else:
            print(f"❌ Failed to update teacher profile: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error updating teacher profile: {e}")
        return False
    
    # Step 3: Verify the update by getting the profile again
    print("\n3️⃣ Verifying the update...")
    try:
        response = requests.get(f"{API_BASE}/teachers/teachers/19/")
        if response.status_code == 200:
            final_data = response.json()
            print(f"✅ Successfully retrieved updated teacher profile")
            print(f"   Final bio: {final_data.get('bio', 'None')}")
            print(f"   Final date_of_birth: {final_data.get('date_of_birth', 'None')}")
            
            # Check if the update was successful
            if final_data.get('bio') == update_data['bio']:
                print("✅ Bio update verified successfully!")
            else:
                print("❌ Bio update verification failed!")
                return False
                
            if final_data.get('date_of_birth') == update_data['date_of_birth']:
                print("✅ Date of birth update verified successfully!")
            else:
                print("❌ Date of birth update verification failed!")
                return False
                
        else:
            print(f"❌ Failed to verify update: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error verifying update: {e}")
        return False
    
    print("\n🎉 All tests passed! Teacher profile edit functionality is working correctly.")
    return True

def test_user_profile_connection():
    """Test that the user profile is properly connected"""
    
    print("\n🔗 Testing User Profile Connection")
    print("=" * 40)
    
    # Get teacher profile
    try:
        response = requests.get(f"{API_BASE}/teachers/teachers/19/")
        if response.status_code == 200:
            teacher_data = response.json()
            
            # Check if user profile fields are present
            if 'bio' in teacher_data:
                print(f"✅ Bio field is present: {teacher_data['bio']}")
            else:
                print("❌ Bio field is missing from teacher response")
                return False
                
            if 'date_of_birth' in teacher_data:
                print(f"✅ Date of birth field is present: {teacher_data['date_of_birth']}")
            else:
                print("❌ Date of birth field is missing from teacher response")
                return False
                
            print("✅ User profile connection is working correctly!")
            return True
        else:
            print(f"❌ Failed to get teacher profile: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing user profile connection: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Teacher Profile Edit Tests")
    print("=" * 50)
    
    # Test user profile connection first
    if not test_user_profile_connection():
        print("\n❌ User profile connection test failed. Stopping tests.")
        exit(1)
    
    # Test the complete edit flow
    if test_teacher_profile_edit():
        print("\n🎉 All tests completed successfully!")
        print("\n📋 Summary:")
        print("   ✅ User profile connection is working")
        print("   ✅ Teacher profile update is working")
        print("   ✅ Bio field updates correctly")
        print("   ✅ Date of birth field updates correctly")
        print("   ✅ Updates persist after save")
        print("\n💡 The frontend should now be able to edit and save bio and date of birth!")
    else:
        print("\n❌ Some tests failed. Please check the backend implementation.")
        exit(1)





