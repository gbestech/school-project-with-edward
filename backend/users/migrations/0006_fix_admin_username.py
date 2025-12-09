from django.db import migrations

def fix_admin_username(apps, schema_editor):
    User = apps.get_model('users', 'CustomUser')

    try:
        # Try to find by the old username that was actually created
        user = User.objects.filter(is_superuser=True, is_staff=True).first()

        if user and user.username != "ADM/AIS/DEC/25/0001":
            old_username = user.username
            user.username = "ADM/AIS/DEC/25/0001"
            user.save()
            print(
                f"✅ Updated admin username from '{old_username}' to '{user.username}'"
            )
        else:
            print(f"ℹ️ Admin username already correct or not found")
    except Exception as e:
        print(f"⚠️ Error updating admin username: {e}")


def reverse_fix(apps, schema_editor):
    # Optional: define reverse operation if needed
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0005_create_production_admin"),  # Make sure this matches exactly
    ]

    operations = [
        migrations.RunPython(fix_admin_username, reverse_fix),
    ]
