from django.http import JsonResponse
from django.conf import settings
import sys


def health_check(request):
    """
    Enhanced health check endpoint to verify deployment configuration
    """
    return JsonResponse(
        {
            "status": "healthy",
            "debug": settings.DEBUG,
            "allowed_hosts": settings.ALLOWED_HOSTS,
            "cors_origins": settings.CORS_ALLOWED_ORIGINS,
            "csrf_origins": settings.CSRF_TRUSTED_ORIGINS,
            "frontend_url": settings.FRONTEND_URL,
            "python_version": sys.version,
            "database": (
                "connected" if settings.DATABASES.get("default") else "not configured"
            ),
        }
    )
