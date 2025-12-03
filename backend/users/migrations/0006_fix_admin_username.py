from django.db import migrations

def fix_admin_username(apps, schema_editor):
    User = apps.get_model('users', 'CustomUser')
    
    try:
        # Find the user with wrong username
        user = User.objects.get(username='schooladmin')
        # Update to correct format
        user.username = 'ADM/AIS/DEC/25/0001'
        user.save()
        print(f"✅ Updated admin username to {user.username}")
    except User.DoesNotExist:
        print("ℹ️ User 'schooladmin' not found, skipping")

class Migration(migrations.Migration):
    dependencies = [
        ('users', 'XXXX_create_production_admin'),  # Your previous migration
    ]

    operations = [
        migrations.RunPython(fix_admin_username, migrations.RunPython.noop),
    ]