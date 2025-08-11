from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()

class Command(BaseCommand):
    help = 'Reset password for a user by username'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to reset password for')
        parser.add_argument('--password', type=str, help='Specific password to set (optional)')

    def handle(self, *args, **options):
        username = options['username']
        custom_password = options['password']

        try:
            user = User.objects.get(username=username)
            
            if custom_password:
                new_password = custom_password
            else:
                # Generate a random password
                new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            
            user.set_password(new_password)
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Password reset successful for user: {username}\n'
                    f'New password: {new_password}\n'
                    f'Email: {user.email}\n'
                    f'Full name: {user.get_full_name()}'
                )
            )
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with username "{username}" not found.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error resetting password: {str(e)}')
            ) 