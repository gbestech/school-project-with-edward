from django.db import migrations
from django.contrib.auth.hashers import make_password
import os
from datetime import datetime

def create_admin(apps, schema_editor):
    User = apps.get_model('users', 'CustomUser')

    # Generate username following your pattern: PREFIX/SCHOOL/MONTH/YEAR/NUMBER
    # Example: ADM/AIS/DEC/25/0001
    current_month = datetime.now().strftime("%b").upper()  # DEC
    current_year = datetime.now().strftime("%y")  # 25

    # Use environment variables or defaults
    username = os.getenv(
        "INITIAL_ADMIN_USERNAME", f"ADM/AIS/{current_month}/{current_year}/0001"
    )
    email = os.getenv('INITIAL_ADMIN_EMAIL', 'admin@yourschool.com')
    password = os.getenv('INITIAL_ADMIN_PASSWORD', 'TempPassword123!')

    # Only create if doesn't exist
    if not User.objects.filter(username=username).exists():
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
        print(f"ℹ️ Admin user {username} already exists")

class Migration(migrations.Migration):
    dependencies = [
        ("users", "0004_alter_customuser_options_customuser_school_and_more"),
    ]

    operations = [
        migrations.RunPython(create_admin, migrations.RunPython.noop),
    ]
