# authentication/signals.py
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """Create auth token for new users (for DRF token auth if needed)"""
    if created:
        Token.objects.get_or_create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def handle_user_verification(sender, instance=None, created=False, **kwargs):
    """Handle user verification events"""
    if not created:
        # Check if user was just activated (verified)
        if instance.is_active and hasattr(instance, "_state"):
            # Get the previous state to check if is_active changed
            try:
                old_instance = sender.objects.get(pk=instance.pk)
                if hasattr(old_instance, "is_active") and not old_instance.is_active:
                    # User was just activated, send welcome email
                    send_welcome_email(instance)
            except sender.DoesNotExist:
                pass


@receiver(pre_save, sender=settings.AUTH_USER_MODEL)
def store_previous_state(sender, instance=None, **kwargs):
    """Store previous state to detect changes"""
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_is_active = old_instance.is_active
        except sender.DoesNotExist:
            instance._old_is_active = None


def send_welcome_email(user):
    """Send welcome email after successful verification"""
    try:
        send_mail(
            subject="Welcome to Our Platform!",
            message=f"""
            Hi {user.first_name},
            
            Welcome to our platform! Your account has been successfully verified.
            
            You can now log in using your email and password.
            
            Best regards,
            The Team
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Welcome email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {e}")


# Signal for cleaning up expired verification codes
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def cleanup_expired_verification_codes(sender, instance=None, created=False, **kwargs):
    """Clean up expired verification codes"""
    if not created and instance:
        # Check if verification code is expired
        if (
            hasattr(instance, "verification_code_expires")
            and instance.verification_code_expires
            and instance.verification_code_expires < timezone.now()
        ):

            # Clear expired verification code
            instance.verification_code = None
            instance.verification_code_expires = None
            # Use update to avoid triggering signals again
            sender.objects.filter(pk=instance.pk).update(
                verification_code=None, verification_code_expires=None
            )
            logger.info(f"Cleared expired verification code for user {instance.email}")
