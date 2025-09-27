from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


def clear_subject_caches():
    """Clear all subject-related caches"""
    cache_keys = [
        "subjects_cache_v1",
        "subjects_by_category_v3",
        "subjects_by_education_level_v2",
        "nursery_subjects_v1",
        "ss_subjects_by_type_v1",
        "cross_cutting_subjects_v1",
        "subject_statistics_v1",
    ]

    cleared_count = 0
    for key in cache_keys:
        if cache.delete(key):
            cleared_count += 1

    logger.info(f"Cleared {cleared_count} subject cache keys")
    return cleared_count
