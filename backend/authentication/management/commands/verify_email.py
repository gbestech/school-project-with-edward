# 3. Management command to verify user email
# Create: management/commands/verify_email.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from allauth.account.models import EmailAddress

User = get_user_model()


class Command(BaseCommand):
    help = "Verify email address for a user"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="Email address to verify")

    def handle(self, *args, **options):
        email = options["email"]

        try:
            user = User.objects.get(email=email)

            # Get or create EmailAddress record
            email_address, created = EmailAddress.objects.get_or_create(
                user=user, email=email, defaults={"verified": True, "primary": True}
            )

            if not created and not email_address.verified:
                email_address.verified = True
                email_address.save()
                self.stdout.write(
                    self.style.SUCCESS(f"Email {email} verified successfully")
                )
            elif email_address.verified:
                self.stdout.write(
                    self.style.WARNING(f"Email {email} was already verified")
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f"Email {email} created and verified")
                )

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User with email {email} not found"))
