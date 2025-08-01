from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'List all users in the system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--role',
            type=str,
            help='Filter users by role (admin, teacher, student, parent)',
        )
        parser.add_argument(
            '--active',
            action='store_true',
            help='Show only active users',
        )
        parser.add_argument(
            '--inactive',
            action='store_true',
            help='Show only inactive users',
        )

    def handle(self, *args, **options):
        role = options.get('role')
        active_only = options.get('active')
        inactive_only = options.get('inactive')

        # Build the query
        users = User.objects.all()
        
        if role:
            users = users.filter(role=role)
        
        if active_only:
            users = users.filter(is_active=True)
        
        if inactive_only:
            users = users.filter(is_active=False)

        # Order by creation date
        users = users.order_by('date_joined')

        if not users.exists():
            self.stdout.write(
                self.style.WARNING('No users found matching the criteria.')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f'Found {users.count()} user(s):\n')
        )

        for user in users:
            status = '✅ Active' if user.is_active else '❌ Inactive'
            staff_status = '👑 Staff' if user.is_staff else ''
            super_status = '🔑 Superuser' if user.is_superuser else ''
            
            self.stdout.write(
                f'📧 {user.email}\n'
                f'   👤 {user.first_name} {user.last_name}\n'
                f'   🆔 {user.username}\n'
                f'   🏷️  {user.role.title()}\n'
                f'   📊 {status} {staff_status} {super_status}\n'
                f'   📅 Joined: {user.date_joined.strftime("%Y-%m-%d %H:%M")}\n'
                f'   {"─" * 50}'
            ) 