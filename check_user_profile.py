#!/usr/bin/env python3
"""
Check if user profile exists for teacher
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import CustomUser
from userprofile.models import UserProfile
from teacher.models import Teacher

def check_user_profile():
    """Check if user profile exists for teacher"""
    
    print("🔍 Checking User Profile for Teacher")
    print("=" * 40)
    
    # Get teacher with ID 19
    try:
        teacher = Teacher.objects.get(id=19)
        print(f"✅ Found teacher: {teacher.user.email}")
        print(f"   User ID: {teacher.user.id}")
        
        # Check if user profile exists
        try:
            user_profile = UserProfile.objects.get(user=teacher.user)
            print(f"✅ User profile exists")
            print(f"   Bio: {user_profile.bio}")
            print(f"   Date of birth: {user_profile.date_of_birth}")
        except UserProfile.DoesNotExist:
            print("❌ User profile does not exist - creating one...")
            user_profile = UserProfile.objects.create(user=teacher.user)
            print(f"✅ Created user profile for {teacher.user.email}")
            
    except Teacher.DoesNotExist:
        print("❌ Teacher with ID 19 not found")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    check_user_profile()





