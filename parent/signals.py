from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import CustomUser
from .models import ParentProfile
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=CustomUser)
def create_parent_profile(sender, instance, created, **kwargs):
    if created and instance.role == "parent":
        profile, created_profile = ParentProfile.objects.get_or_create(user=instance)
        if created_profile:
            logger.info(f"ParentProfile created for {instance.email}")
