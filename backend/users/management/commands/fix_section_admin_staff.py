# management/commands/fix_section_admin_staff.py
# Run this as: python manage.py fix_section_admin_staff

from django.core.management.base import BaseCommand
from users.models import CustomUser


class Command(BaseCommand):
    help = "Fix is_staff status for section admins"

    def handle(self, *args, **options):
        section_admin_roles = [
            "nursery_admin",
            "primary_admin",
            "junior_secondary_admin",
            "senior_secondary_admin",
            "secondary_admin",
        ]

        # Get all section admins
        section_admins = CustomUser.objects.filter(role__in=section_admin_roles)

        self.stdout.write(
            self.style.WARNING(f"\nFound {section_admins.count()} section admins")
        )

        for user in section_admins:
            old_staff = user.is_staff

            # Section admins should NOT have is_staff=True
            # unless they need Django admin panel access
            # For now, we'll set to False for proper section filtering
            user.is_staff = False
            user.save()

            status = "✅" if old_staff else "⏭️"
            self.stdout.write(
                f"{status} {user.username} ({user.role}): "
                f"is_staff {old_staff} → {user.is_staff}"
            )

        # Show superadmins (these should have is_staff=True)
        superadmins = CustomUser.objects.filter(
            role="superadmin"
        ) | CustomUser.objects.filter(is_superuser=True)

        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Superadmins (should have is_staff=True):")
        )
        for user in superadmins:
            self.stdout.write(
                f"  {user.username}: is_staff={user.is_staff}, is_superuser={user.is_superuser}"
            )

        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Fixed {section_admins.count()} section admins!")
        )
        self.stdout.write(
            self.style.WARNING(
                "\n⚠️  Note: If section admins need Django admin panel access,"
            )
        )
        self.stdout.write(
            self.style.WARNING(
                "    you can manually set is_staff=True for specific users."
            )
        )
