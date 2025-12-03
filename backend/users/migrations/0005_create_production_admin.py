from django.db import migrations
from django.contrib.auth.hashers import make_password
import os

def create_admin(apps, schema_editor):
    User = apps.get_model('users', 'CustomUser')
    
    # Use environment variables for security
    username = os.getenv('INITIAL_ADMIN_USERNAME', 'schooladmin')
    email = os.getenv('INITIAL_ADMIN_EMAIL', 'admin@yourschool.com')
    password = os.getenv('INITIAL_ADMIN_PASSWORD', 'TempPassword123!')
    
    # Only create if doesn't exist
    if not User.objects.filter(email=email).exists():
        User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            is_superuser=True,
            is_staff=True,
            is_active=True,
        )
        print(f"✅ Created admin user: {username}")
    else:
        print(f"ℹ️ Admin user {email} already exists")

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0004_alter_customuser_options_customuser_school_and_more'),  # Your last migration
    ]

    operations = [
        migrations.RunPython(create_admin, migrations.RunPython.noop),
    ]