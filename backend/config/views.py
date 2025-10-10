# config/views.py - Complete version
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.contrib.auth import get_user_model
from allauth.account.models import EmailAddress
from django.core.management import call_command  # ← Add this
import json
import io  # ← Add this
import sys  # ← Add this
import os

User = get_user_model()


def api_root(request):
    """API root endpoint"""
    return JsonResponse(
        {
            "message": "School Management System API",
            "version": "1.0",
            "endpoints": {
                "auth": "/api/dj-rest-auth/",
                "login": "/api/dj-rest-auth/login/",
                "logout": "/api/dj-rest-auth/logout/",
                "user": "/api/dj-rest-auth/user/",
                "registration": "/api/dj-rest-auth/registration/",
                "debug_login": "/api/debug/login/" if settings.DEBUG else None,
            },
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def debug_login_function(request):
    """Debug login endpoint - only available when DEBUG=True"""
    if not settings.DEBUG:
        return JsonResponse(
            {"error": "Debug endpoint not available in production"}, status=403
        )

    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        # Authenticate user
        authenticated_user = authenticate(request, email=email, password=password)

        if authenticated_user:
            # Force verify email for debug purposes
            try:
                email_address, created = EmailAddress.objects.get_or_create(
                    user=user, email=email, defaults={"verified": True, "primary": True}
                )
                if not created and not email_address.verified:
                    email_address.verified = True
                    email_address.save()

                login(request, authenticated_user)

                return JsonResponse(
                    {
                        "success": True,
                        "user_id": user.id,
                        "email": user.email,
                        "message": "Login successful",
                        "email_verified": (
                            email_address.verified if email_address else False
                        ),
                    }
                )
            except Exception as e:
                # Even if email verification fails, continue with login
                login(request, authenticated_user)
                return JsonResponse(
                    {
                        "success": True,
                        "user_id": user.id,
                        "email": user.email,
                        "message": "Login successful (email verification skipped)",
                        "warning": str(e),
                    }
                )
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def check_database_schema(request):
    """Check database schema - REMOVE AFTER USE"""

    secret = request.GET.get("secret", "")
    if secret != "migrate_now_2025":
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        from django.db import connection

        with connection.cursor() as cursor:
            # Check if column exists
            cursor.execute(
                """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='classroom_classroom' 
                AND column_name='academic_session_id';
            """
            )
            result = cursor.fetchone()

            # Get all columns in classroom_classroom
            cursor.execute(
                """
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name='classroom_classroom'
                ORDER BY ordinal_position;
            """
            )
            all_columns = cursor.fetchall()

        return JsonResponse(
            {
                "status": "success",
                "academic_session_id_exists": result is not None,
                "all_columns": [
                    {"name": col[0], "type": col[1]} for col in all_columns
                ],
            }
        )
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)}, status=500)


@csrf_exempt
def force_migrate(request):
    # Optional: restrict access to only your secret key (for safety)
    secret = request.GET.get("secret")
    allowed_secret = os.getenv("FORCE_MIGRATE_SECRET", "mysecuretoken123")

    if secret != allowed_secret:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    try:
        call_command("migrate", interactive=False)
        return JsonResponse(
            {"status": "success", "message": "Migrations applied successfully"}
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
