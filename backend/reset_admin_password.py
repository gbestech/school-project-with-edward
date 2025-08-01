#!/usr/bin/env python
"""
Reset admin password and activate account
"""
import os
import sys
import django
import secrets
import string

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_admin_password():
    """Reset admin password and activate account"""
    print("🔧 Resetting admin password...")
    
    # List all users
    users = User.objects.all()
    print(f"\n📊 Found {users.count()} user(s):")
    
    for i, user in enumerate(users):
        print(f"{i+1}. {user.first_name} {user.last_name} ({user.email}) - {user.role}")
    
    # Let user choose which admin to reset
    try:
        choice = int(input("\nEnter the number of the admin to reset (or 0 to exit): "))
        if choice == 0:
            return
        if choice < 1 or choice > len(users):
            print("❌ Invalid choice!")
            return
        
        selected_user = users[choice - 1]
        print(f"\n🎯 Selected: {selected_user.first_name} {selected_user.last_name} ({selected_user.email})")
        
        # Generate new password
        new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
        
        # Set new password
        selected_user.set_password(new_password)
        
        # Activate the user
        selected_user.is_active = True
        selected_user.is_staff = True
        selected_user.is_superuser = True
        selected_user.save()
        
        print(f"\n✅ Admin account updated successfully!")
        print(f"📧 Email: {selected_user.email}")
        print(f"🆔 Username: {selected_user.username}")
        print(f"🔑 New Password: {new_password}")
        print(f"✅ Active: {selected_user.is_active}")
        print(f"👑 Staff: {selected_user.is_staff}")
        print(f"🔑 Superuser: {selected_user.is_superuser}")
        
        print(f"\n💡 You can now login with:")
        print(f"   Username: {selected_user.username}")
        print(f"   Password: {new_password}")
        
    except ValueError:
        print("❌ Please enter a valid number!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    reset_admin_password() 