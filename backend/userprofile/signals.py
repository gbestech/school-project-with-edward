from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserProfile
from parent.models import ParentProfile
import logging

logger = logging.getLogger(__name__)
logger.debug("UserProfile signals module loaded")


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profiles(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.role == "teacher" or instance.role == "admin":
        UserProfile.objects.get_or_create(user=instance)

    elif instance.role == "parent":
        ParentProfile.objects.get_or_create(user=instance)


# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_or_update_user_profile(sender, instance, created, **kwargs):
#     if created and instance.role in ["admin", "teacher"]:
#         UserProfile.objects.get_or_create(user=instance)
