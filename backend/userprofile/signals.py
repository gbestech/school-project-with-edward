from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserProfile
from parent.models import ParentProfile
import logging

logger = logging.getLogger(__name__)
logger.debug("UserProfile signals module loaded")


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def handle_user_profile(sender, instance, created, **kwargs):
    """Handle profile creation and updates for all user types"""

    if instance.role in ["teacher", "admin", "student"]:
        # Handle UserProfile
        profile, profile_created = UserProfile.objects.get_or_create(user=instance)
        if not profile_created:
            # Profile already exists, just save it to trigger any updates
            try:
                profile.save()
            except Exception as e:
                logger.error(f"Error updating UserProfile for user {instance.id}: {e}")
    # Removed ParentProfile creation to prevent duplicate errors


# Alternative: If you want to keep separate signals, use this approach
# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_user_profiles(sender, instance, created, **kwargs):
#     """Create appropriate profiles when user is created"""
#     if created:
#         if instance.role in ["teacher", "admin"]:
#             UserProfile.objects.get_or_create(user=instance)
#         elif instance.role == "parent":
#             ParentProfile.objects.get_or_create(user=instance)


# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def save_user_profile(sender, instance, **kwargs):
#     """Save profiles when user is updated (not created)"""
#     if not instance._state.adding:  # Only for existing users
#         if instance.role in ["teacher", "admin"]:
#             UserProfile.objects.filter(user=instance).update(
#                 # Add any fields you want to update automatically
#             )
#         elif instance.role == "parent":
#             ParentProfile.objects.filter(user=instance).update(
#                 # Add any fields you want to update automatically
#             )
