from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import CustomUser
from .models import ParentProfile
import logging

logger = logging.getLogger(__name__)
