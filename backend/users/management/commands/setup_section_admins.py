from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from users.models import CustomUser


class Command(BaseCommand):
    help = "Set up section admin roles and permissions"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("=" * 70))
        self.stdout.write(self.style.SUCCESS("SETTING UP SECTION ADMIN ROLES"))
        self.stdout.write(self.style.SUCCESS("=" * 70))

        # Define role groups with proper names
        admin_roles = [
            "Super Admin",
            "Senior Secondary Admin",
            "Junior Secondary Admin",
            "Primary Admin",
            "Nursery Admin",
        ]

        # Create groups for new admin roles
        self.stdout.write("\n1. Creating admin role groups...")
        for role_name in admin_roles:
            group, created = Group.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Created: {role_name}"))
            else:
                self.stdout.write(f"  - Already exists: {role_name}")

        # Get existing Admin permissions (we'll copy these to section admins)
        self.stdout.write("\n2. Assigning permissions...")
        try:
            admin_group = Group.objects.get(name="Admin")
            admin_permissions = admin_group.permissions.all()

            self.stdout.write(
                f"  Found {admin_permissions.count()} permissions from Admin group"
            )

            # Assign permissions to section admins
            section_admin_groups = [
                "Senior Secondary Admin",
                "Junior Secondary Admin",
                "Primary Admin",
                "Nursery Admin",
            ]

            for admin_role in section_admin_groups:
                group = Group.objects.get(name=admin_role)
                group.permissions.set(admin_permissions)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  ✓ {admin_role}: {admin_permissions.count()} permissions"
                    )
                )

            # Super Admin gets all permissions
            super_admin_group = Group.objects.get(name="Super Admin")
            all_permissions = Permission.objects.all()
            super_admin_group.permissions.set(all_permissions)
            self.stdout.write(
                self.style.SUCCESS(
                    f"  ✓ Super Admin: {all_permissions.count()} permissions (ALL)"
                )
            )

        except Group.DoesNotExist:
            self.stdout.write(
                self.style.WARNING(
                    "\n  ⚠ Admin group not found. Creating with basic permissions..."
                )
            )
            # Create basic admin group
            admin_group = Group.objects.create(name="Admin")
            # You can add default permissions here if needed

        # Show summary
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS("SUMMARY"))
        self.stdout.write("=" * 70)

        for role_name in admin_roles:
            group = Group.objects.get(name=role_name)
            self.stdout.write(f"{role_name}: {group.permissions.count()} permissions")

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS("✓ Setup complete!"))
        self.stdout.write("=" * 70)
        self.stdout.write("\nNext steps:")
        self.stdout.write("1. Create section admin users in Django admin")
        self.stdout.write("2. Assign sections to teachers and students")
        self.stdout.write(
            "3. Run: python manage.py assign_sections (if you create that command)"
        )
