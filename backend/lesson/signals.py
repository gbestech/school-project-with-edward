from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Lesson, LessonAttendance
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Lesson)
def lesson_post_save(sender, instance, created, **kwargs):
    """Handle lesson post-save events"""
    if created:
        logger.info(f"New lesson created: {instance.title}")
    else:
        logger.info(f"Lesson updated: {instance.title}")


@receiver(post_delete, sender=Lesson)
def lesson_post_delete(sender, instance, **kwargs):
    """Handle lesson post-delete events"""
    logger.info(f"Lesson deleted: {instance.title}")


@receiver(post_save, sender=LessonAttendance)
def attendance_post_save(sender, instance, created, **kwargs):
    """Handle attendance post-save events"""
    if created:
        logger.info(f"New attendance record for lesson: {instance.lesson.title}")
    else:
        logger.info(f"Attendance updated for lesson: {instance.lesson.title}")
