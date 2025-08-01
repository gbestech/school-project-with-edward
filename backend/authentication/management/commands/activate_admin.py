from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Activate the first admin user and grant admin privileges'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email of the admin user to activate',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username of the admin user to activate',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        username = options.get('username')
        
        if not email and not username:
            self.stdout.write(
                self.style.ERROR('Please provide either --email or --username')
            )
            return

        try:
            with transaction.atomic():
                # Find the user
                if email:
                    user = User.objects.get(email=email)
                else:
                    user = User.objects.get(username=username)

                # Check if user exists and is an admin
                if user.role != 'admin':
                    self.stdout.write(
                        self.style.WARNING(
                            f'User {user.email} is not an admin (role: {user.role}). '
                            'Setting role to admin...'
                        )
                    )
                    user.role = 'admin'

                # Activate the user and grant admin privileges
                user.is_active = True
                user.is_staff = True
                user.is_superuser = True
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Admin user activated successfully!\n'
                        f'   Email: {user.email}\n'
                        f'   Username: {user.username}\n'
                        f'   Role: {user.role}\n'
                        f'   Active: {user.is_active}\n'
                        f'   Staff: {user.is_staff}\n'
                        f'   Superuser: {user.is_superuser}'
                    )
                )

        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(
                    f'❌ User not found with {"email: " + email if email else "username: " + username}'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error activating admin: {str(e)}')
            ) 