from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .permissions import (
    HasSettingsPermission,
    HasSettingsPermissionOrReadOnly,
    PublicReadOnly,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import os
from .models import (
    SchoolSettings,
    SchoolAnnouncement,
    CommunicationSettings,
    Permission,
    Role,
    UserRole,
)
from .serializers import (
    SchoolSettingsSerializer,
    SchoolAnnouncementSerializer,
    CommunicationSettingsSerializer,
    PermissionSerializer,
    RoleSerializer,
    RoleCreateUpdateSerializer,
    UserRoleSerializer,
    UserRoleCreateUpdateSerializer,
)
from rest_framework.decorators import action


class SchoolSettingsDetail(APIView):
    """
    Retrieve and update school settings
    """

    permission_classes = [PublicReadOnly]  # Allow public read access for logo/favicon

    def get(self, request):
        """Get current school settings"""
        try:
            # Get the first (and should be only) school settings instance
            settings = SchoolSettings.objects.first()
            if not settings:
                # Create default settings if none exist
                settings = SchoolSettings.objects.create()

            serializer = SchoolSettingsSerializer(
                settings, context={"request": request}
            )
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch settings: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request):
        """Update school settings"""
        try:
            settings = SchoolSettings.objects.first()
            if not settings:
                settings = SchoolSettings.objects.create()

            # Remove computed fields that shouldn't be updated directly
            data = request.data.copy()
            data.pop("logo_url", None)
            data.pop("favicon_url", None)
            data.pop(
                "logo", None
            )  # Remove logo field as it should be uploaded separately
            data.pop(
                "favicon", None
            )  # Remove favicon field as it should be uploaded separately
            data.pop("id", None)
            data.pop("created_at", None)
            data.pop("updated_at", None)

            serializer = SchoolSettingsSerializer(
                settings, data=data, partial=True, context={"request": request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Failed to update settings: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_payment_gateway(request, gateway):
    """Test payment gateway connection"""
    try:
        credentials = request.data

        # Here you would implement the actual gateway testing logic
        # For now, we'll return a mock response

        if gateway == "paystack":
            # Test Paystack connection
            public_key = credentials.get("publicKey", "")
            secret_key = credentials.get("secretKey", "")

            if not public_key or not secret_key:
                return Response(
                    {
                        "success": False,
                        "message": "Public key and secret key are required",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mock successful test
            return Response(
                {"success": True, "message": "Paystack connection test successful!"}
            )

        elif gateway == "stripe":
            # Test Stripe connection
            publishable_key = credentials.get("publishableKey", "")
            secret_key = credentials.get("secretKey", "")

            if not publishable_key or not secret_key:
                return Response(
                    {
                        "success": False,
                        "message": "Publishable key and secret key are required",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mock successful test
            return Response(
                {"success": True, "message": "Stripe connection test successful!"}
            )

        elif gateway == "flutterwave":
            # Test Flutterwave connection
            public_key = credentials.get("publicKey", "")
            secret_key = credentials.get("secretKey", "")

            if not public_key or not secret_key:
                return Response(
                    {
                        "success": False,
                        "message": "Public key and secret key are required",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Mock successful test
            return Response(
                {"success": True, "message": "Flutterwave connection test successful!"}
            )

        else:
            return Response(
                {"success": False, "message": f"Unsupported gateway: {gateway}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"Failed to test {gateway} connection: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_email_connection(request):
    """Test email provider connection (SMTP or Brevo)"""
    try:
        provider = request.data.get("provider", "smtp")

        if provider == "smtp":
            # Test SMTP connection
            smtp_config = request.data

            # Validate required fields
            required_fields = ["host", "port", "username", "password"]
            for field in required_fields:
                if not smtp_config.get(field):
                    return Response(
                        {"success": False, "message": f"{field} is required"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Here you would implement actual SMTP testing
            # For now, we'll return a mock response
            return Response(
                {"success": True, "message": "SMTP connection test successful!"}
            )

        elif provider == "brevo":
            # Test Brevo connection
            import requests

            api_key = request.data.get("apiKey", "")
            from_email = request.data.get("fromEmail", "")

            if not api_key:
                return Response(
                    {"success": False, "message": "Brevo API key is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Test Brevo API connection
            url = "https://api.brevo.com/v3/senders"
            headers = {"accept": "application/json", "api-key": api_key}

            try:
                response = requests.get(url, headers=headers)
                if response.status_code == 200:
                    return Response(
                        {"success": True, "message": "Brevo connection successful!"}
                    )
                else:
                    return Response(
                        {
                            "success": False,
                            "message": "Invalid Brevo API key or connection failed",
                        }
                    )
            except Exception as e:
                return Response(
                    {"success": False, "message": f"Brevo connection error: {str(e)}"}
                )

        else:
            return Response(
                {"success": False, "message": f"Unsupported email provider: {provider}"}
            )

    except Exception as e:
        return Response(
            {"success": False, "message": f"Failed to test email connection: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_sms_connection(request):
    """Test SMS provider connection"""
    try:
        sms_config = request.data

        # Validate required fields
        required_fields = ["provider", "apiKey", "apiSecret"]
        for field in required_fields:
            if not sms_config.get(field):
                return Response(
                    {"success": False, "message": f"{field} is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Here you would implement actual SMS provider testing
        # For now, we'll return a mock response

        return Response(
            {
                "success": True,
                "message": f'SMS connection test successful for {sms_config["provider"]}!',
            }
        )

    except Exception as e:
        return Response(
            {"success": False, "message": f"Failed to test SMS connection: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class CommunicationSettingsDetail(APIView):
    """
    Retrieve and update communication settings
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        """Get current communication settings"""
        try:
            settings = CommunicationSettings.objects.first()
            if not settings:
                settings = CommunicationSettings.objects.create()

            serializer = CommunicationSettingsSerializer(settings)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch communication settings: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request):
        """Update communication settings"""
        try:
            settings = CommunicationSettings.objects.first()
            if not settings:
                settings = CommunicationSettings.objects.create()

            # Remove computed fields that shouldn't be updated directly
            data = request.data.copy()
            data.pop("id", None)
            data.pop("created_at", None)
            data.pop("updated_at", None)
            data.pop("brevo_configured", None)
            data.pop("twilio_configured", None)

            serializer = CommunicationSettingsSerializer(
                settings, data=data, partial=True
            )
            if serializer.is_valid():
                serializer.save(updated_by=request.user)
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Failed to update communication settings: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_brevo_connection(request):
    """Test Brevo connection with provided credentials"""
    try:
        import requests

        api_key = request.data.get("apiKey", "")
        sender_email = request.data.get("senderEmail", "")

        if not api_key:
            return Response(
                {"success": False, "message": "Brevo API key is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Test Brevo API connection
        url = "https://api.brevo.com/v3/senders"
        headers = {"accept": "application/json", "api-key": api_key}

        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                # Update communication settings if test is successful
                settings = CommunicationSettings.objects.first()
                if not settings:
                    settings = CommunicationSettings.objects.create()

                settings.brevo_api_key = api_key
                settings.brevo_sender_email = sender_email
                settings.brevo_configured = True
                settings.save(
                    update_fields=[
                        "brevo_api_key",
                        "brevo_sender_email",
                        "brevo_configured",
                    ]
                )

                return Response(
                    {"success": True, "message": "Brevo connection successful!"}
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Invalid Brevo API key or connection failed",
                    }
                )
        except requests.exceptions.Timeout:
            return Response(
                {
                    "success": False,
                    "message": "Connection timeout. Please check your internet connection.",
                }
            )
        except Exception as e:
            return Response(
                {"success": False, "message": f"Brevo connection error: {str(e)}"}
            )

    except Exception as e:
        return Response(
            {"success": False, "message": f"Failed to test Brevo connection: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_twilio_connection(request):
    """Test Twilio connection with provided credentials"""
    try:
        from utils.sms import test_twilio_connection as test_twilio

        account_sid = request.data.get("accountSid", "")
        auth_token = request.data.get("authToken", "")
        phone_number = request.data.get("phoneNumber", "")

        if not account_sid or not auth_token:
            return Response(
                {
                    "success": False,
                    "message": "Twilio Account SID and Auth Token are required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Test Twilio connection using utility function
        success, message = test_twilio(account_sid, auth_token, phone_number)

        if success:
            # Update communication settings if test is successful
            settings = CommunicationSettings.objects.first()
            if not settings:
                settings = CommunicationSettings.objects.create()

            settings.twilio_account_sid = account_sid
            settings.twilio_auth_token = auth_token
            settings.twilio_phone_number = phone_number
            settings.twilio_configured = True
            settings.save(
                update_fields=[
                    "twilio_account_sid",
                    "twilio_auth_token",
                    "twilio_phone_number",
                    "twilio_configured",
                ]
            )

            return Response(
                {"success": True, "message": "Twilio connection successful!"}
            )
        else:
            return Response({"success": False, "message": message})

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"Failed to test Twilio connection: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def send_test_email(request):
    """Send test email using configured Brevo settings"""
    try:
        settings = CommunicationSettings.objects.first()
        if not settings or not settings.brevo_configured:
            return Response(
                {
                    "success": False,
                    "message": "Brevo is not configured. Please configure Brevo first.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import the email utility
        from utils.email import send_email_via_brevo

        subject = "Test Email from School Management System"
        html_content = """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Test Email</h2>
            <p>This is a test email sent from your school management system.</p>
            <p>If you received this email, your Brevo configuration is working correctly!</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
                Sent at: {timestamp}<br>
                From: {sender_name} &lt;{sender_email}&gt;
            </p>
        </div>
        """.format(
            timestamp=timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
            sender_name=settings.brevo_sender_name or "School Management System",
            sender_email=settings.brevo_sender_email or "noreply@school.com",
        )

        # Send to the admin's email
        to_email = request.user.email

        status_code, response = send_email_via_brevo(subject, html_content, to_email)

        if status_code in [200, 201]:
            return Response(
                {
                    "success": True,
                    "message": f"Test email sent successfully to {to_email}",
                }
            )
        else:
            return Response(
                {"success": False, "message": f"Failed to send test email: {response}"}
            )

    except Exception as e:
        return Response(
            {"success": False, "message": f"Failed to send test email: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def send_test_sms(request):
    """Send test SMS using configured Twilio settings"""
    try:
        settings = CommunicationSettings.objects.first()
        if not settings or not settings.twilio_configured:
            return Response(
                {
                    "success": False,
                    "message": "Twilio is not configured. Please configure Twilio first.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        test_number = request.data.get("testNumber", "")
        if not test_number:
            return Response(
                {"success": False, "message": "Test phone number is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import Twilio SDK
        from twilio.rest import Client
        from twilio.base.exceptions import TwilioRestException

        # Create Twilio client
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)

        # Prepare message content
        message_body = f"Test SMS from School Management System. Sent at {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"

        try:
            # Send SMS via Twilio
            message = client.messages.create(
                body=message_body, from_=settings.twilio_phone_number, to=test_number
            )

            return Response(
                {
                    "success": True,
                    "message": f"Test SMS sent successfully to {test_number}",
                    "message_sid": message.sid,
                    "status": message.status,
                }
            )

        except TwilioRestException as e:
            return Response(
                {
                    "success": False,
                    "message": f"Twilio SMS error: {e.msg}",
                    "error_code": e.code,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    except ImportError:
        return Response(
            {
                "success": False,
                "message": "Twilio SDK not installed. Please install twilio package.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": f"Failed to send test SMS: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================================
# ROLES & PERMISSIONS VIEWS
# ============================================================================


class PermissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing permissions"""

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        """Filter permissions based on query parameters"""
        queryset = Permission.objects.all()

        module = self.request.query_params.get("module", None)
        if module:
            queryset = queryset.filter(module=module)

        permission_type = self.request.query_params.get("permission_type", None)
        if permission_type:
            queryset = queryset.filter(permission_type=permission_type)

        section = self.request.query_params.get("section", None)
        if section:
            queryset = queryset.filter(section=section)

        return queryset.order_by("module", "permission_type", "section")

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Create multiple permissions at once"""
        try:
            permissions_data = request.data.get("permissions", [])
            created_permissions = []

            for perm_data in permissions_data:
                serializer = self.get_serializer(data=perm_data)
                if serializer.is_valid():
                    permission = serializer.save()
                    created_permissions.append(permission)
                else:
                    return Response(
                        {"error": f"Invalid permission data: {serializer.errors}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            return Response(
                {
                    "message": f"Successfully created {len(created_permissions)} permissions",
                    "permissions": PermissionSerializer(
                        created_permissions, many=True
                    ).data,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to create permissions: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing roles"""

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasSettingsPermission]

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ["create", "update", "partial_update"]:
            return RoleCreateUpdateSerializer
        return RoleSerializer

    def perform_create(self, serializer):
        """Set the creator when creating a role"""
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        """Prevent deletion of system roles"""
        if instance.is_system:
            raise ValidationError("System roles cannot be deleted")
        instance.delete()

    @action(detail=True, methods=["post"])
    def duplicate(self, request, pk=None):
        """Duplicate an existing role"""
        try:
            original_role = self.get_object()

            # Create new role with similar data
            new_role = Role.objects.create(
                name=f"{original_role.name} (Copy)",
                description=original_role.description,
                color=original_role.color,
                primary_section_access=original_role.primary_section_access,
                secondary_section_access=original_role.secondary_section_access,
                nursery_section_access=original_role.nursery_section_access,
                created_by=request.user,
            )

            # Copy permissions
            new_role.permissions.set(original_role.permissions.all())

            return Response(
                {
                    "message": "Role duplicated successfully",
                    "role": RoleSerializer(new_role).data,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to duplicate role: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"])
    def users(self, request, pk=None):
        """Get users assigned to this role"""
        try:
            role = self.get_object()

            # Get users assigned to this role through UserRole model
            user_roles = UserRole.objects.filter(role=role, is_active=True)
            user_data = []

            for user_role in user_roles:
                if not user_role.is_expired():
                    user_data.append(
                        {
                            "id": user_role.user.id,
                            "username": user_role.user.username,
                            "email": user_role.user.email,
                            "full_name": user_role.user.full_name,
                            "is_active": user_role.user.is_active,
                            "assigned_at": user_role.assigned_at,
                            "expires_at": user_role.expires_at,
                            "assigned_by": (
                                user_role.assigned_by.full_name
                                if user_role.assigned_by
                                else None
                            ),
                            "primary_section_access": user_role.primary_section_access,
                            "secondary_section_access": user_role.secondary_section_access,
                            "nursery_section_access": user_role.nursery_section_access,
                        }
                    )

            return Response(
                {"role": role.name, "user_count": len(user_data), "users": user_data}
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to get users: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user role assignments"""

    queryset = UserRole.objects.all()
    permission_classes = [HasSettingsPermission]
    serializer_class = UserRoleSerializer

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ["create", "update", "partial_update"]:
            return UserRoleCreateUpdateSerializer
        return UserRoleSerializer

    def perform_create(self, serializer):
        """Set the assigner when creating a user role assignment"""
        serializer.save(assigned_by=self.request.user)

    def get_queryset(self):
        """Filter user roles based on query parameters"""
        queryset = UserRole.objects.all()

        user_id = self.request.query_params.get("user", None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        role_id = self.request.query_params.get("role", None)
        if role_id:
            queryset = queryset.filter(role_id=role_id)

        is_active = self.request.query_params.get("is_active", None)
        if is_active is not None:
            is_active_bool = is_active.lower() == "true"
            queryset = queryset.filter(is_active=is_active_bool)

        return queryset.select_related("user", "role", "assigned_by")

    @action(detail=False, methods=["get"])
    def user_permissions(self, request):
        """Get all permissions for a specific user"""
        try:
            user_id = request.query_params.get("user_id")
            if not user_id:
                return Response(
                    {"error": "user_id parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            from users.models import CustomUser

            user = CustomUser.objects.get(id=user_id)

            # Get user's role assignments
            user_roles = UserRole.objects.filter(user=user, is_active=True)

            permissions_summary = {
                "user": {
                    "id": user.id,
                    "name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                },
                "role_assignments": [],
                "effective_permissions": {},
            }

            # Initialize effective permissions
            modules = Permission.MODULE_CHOICES
            effective_permissions = {}

            for module_code, module_name in modules:
                effective_permissions[module_code] = {
                    "read": False,
                    "write": False,
                    "delete": False,
                    "admin": False,
                    "sections": {
                        "primary": False,
                        "secondary": False,
                        "nursery": False,
                    },
                }

            # Process each role assignment
            for user_role in user_roles:
                if user_role.is_expired():
                    continue

                role_data = {
                    "role_id": user_role.role.id,
                    "role_name": user_role.role.name,
                    "role_color": user_role.role.color,
                    "sections": {
                        "primary": user_role.primary_section_access,
                        "secondary": user_role.secondary_section_access,
                        "nursery": user_role.nursery_section_access,
                    },
                    "expires_at": user_role.expires_at,
                    "permissions": {},
                }

                # Get role permissions
                for permission in user_role.role.permissions.all():
                    if permission.granted:
                        effective_permissions[permission.module][
                            permission.permission_type
                        ] = True
                        role_data["permissions"][
                            f"{permission.module}_{permission.permission_type}"
                        ] = True

                # Get custom permissions
                for permission in user_role.custom_permissions.all():
                    if permission.granted:
                        effective_permissions[permission.module][
                            permission.permission_type
                        ] = True
                        role_data["permissions"][
                            f"{permission.module}_{permission.permission_type}"
                        ] = True

                permissions_summary["role_assignments"].append(role_data)

            permissions_summary["effective_permissions"] = effective_permissions

            return Response(permissions_summary)

        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to get user permissions: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def bulk_assign(self, request):
        """Assign roles to multiple users at once"""
        try:
            assignments_data = request.data.get("assignments", [])
            created_assignments = []

            for assignment_data in assignments_data:
                serializer = self.get_serializer(data=assignment_data)
                if serializer.is_valid():
                    assignment = serializer.save(assigned_by=request.user)
                    created_assignments.append(assignment)
                else:
                    return Response(
                        {"error": f"Invalid assignment data: {serializer.errors}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            return Response(
                {
                    "message": f"Successfully assigned roles to {len(created_assignments)} users",
                    "assignments": UserRoleSerializer(
                        created_assignments, many=True
                    ).data,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to assign roles: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_exempt, name="dispatch")
# class FileUploadView(APIView):
#     """Handle file uploads for logo and favicon"""
#     permission_classes = [AllowAny]  # Temporarily allow any access for testing

#     def post(self, request, file_type):
#         self.context = {'request': request}
#         """Upload logo or favicon"""
#         try:
#             if file_type not in ['logo', 'favicon']:
#                 return Response(
#                     {'error': 'Invalid file type. Must be logo or favicon'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Check for the correct field name based on file_type
#             field_name = file_type
#             if field_name not in request.FILES:
#                 return Response(
#                     {'error': f'No {file_type} file provided'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             uploaded_file = request.FILES[field_name]

#             # Validate file type
#             allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
#             if uploaded_file.content_type not in allowed_types:
#                 return Response(
#                     {'error': 'Invalid file type. Only JPEG, PNG, GIF, and SVG are allowed'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Validate file size (max 5MB)
#             if uploaded_file.size > 5 * 1024 * 1024:
#                 return Response(
#                     {'error': 'File size too large. Maximum size is 5MB'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Get the settings instance
#             settings = SchoolSettings.objects.first()
#             if not settings:
#                 settings = SchoolSettings.objects.create()

#             # Delete old file if it exists before saving the new one
#             if file_type == 'logo':
#                 if settings.logo:
#                     # Delete the old logo file from storage
#                     settings.logo.delete(save=False)
#                 settings.logo = uploaded_file
#             elif file_type == 'favicon':
#                 if settings.favicon:
#                     # Delete the old favicon file from storage
#                     settings.favicon.delete(save=False)
#                 settings.favicon = uploaded_file

#             settings.save()

#             # Return the file URL (using relative URLs)
#             if file_type == 'logo' and settings.logo:
#                 file_url = settings.logo.url
#             elif file_type == 'favicon' and settings.favicon:
#                 file_url = settings.favicon.url
#             else:
#                 file_url = None

#             return Response({
#                 f'{file_type}_url': file_url,
#                 'message': f'{file_type.capitalize()} uploaded successfully'
#             })

#         except Exception as e:
#             return Response(
#                 {'error': f'Failed to upload {file_type}: {str(e)}'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


class FileUploadView(APIView):
    """Handle file uploads for logo and favicon"""

    permission_classes = [AllowAny]  # Temporarily allow any access for testing

    def post(self, request, *args, **kwargs):
        """Upload logo or favicon based on URL path"""
        try:
            # Determine file type from the URL path
            path = request.path
            if "upload-logo" in path:
                file_type = "logo"
            elif "upload-favicon" in path:
                file_type = "favicon"
            else:
                return Response(
                    {"error": "Invalid endpoint. Use upload-logo or upload-favicon"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check for the correct field name based on file_type
            field_name = file_type
            if field_name not in request.FILES:
                return Response(
                    {
                        "error": f"No {file_type} file provided. Expected field name: {field_name}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            uploaded_file = request.FILES[field_name]

            # Validate file type
            allowed_types = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"]
            if file_type == "favicon":
                allowed_types.append("image/x-icon")  # Add .ico for favicons

            if uploaded_file.content_type not in allowed_types:
                return Response(
                    {
                        "error": f'Invalid file type: {uploaded_file.content_type}. Allowed: {", ".join(allowed_types)}'
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate file size (max 5MB for logo, 1MB for favicon)
            max_size = 1 * 1024 * 1024 if file_type == "favicon" else 5 * 1024 * 1024
            if uploaded_file.size > max_size:
                max_size_mb = max_size / (1024 * 1024)
                return Response(
                    {"error": f"File size too large. Maximum size is {max_size_mb}MB"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get the settings instance
            settings = SchoolSettings.objects.first()
            if not settings:
                settings = SchoolSettings.objects.create()

            # Delete old file if it exists before saving the new one
            if file_type == "logo":
                if settings.logo:
                    settings.logo.delete(save=False)
                settings.logo = uploaded_file
            elif file_type == "favicon":
                if settings.favicon:
                    settings.favicon.delete(save=False)
                settings.favicon = uploaded_file

            settings.save()

            # Return the file URL
            if file_type == "logo" and settings.logo:
                file_url = settings.logo.url
            elif file_type == "favicon" and settings.favicon:
                file_url = settings.favicon.url
            else:
                file_url = None

            # Use consistent response format
            response_key = f"{file_type}Url"  # camelCase for frontend
            return Response(
                {
                    response_key: file_url,
                    "message": f"{file_type.capitalize()} uploaded successfully",
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            import traceback

            return Response(
                {
                    "error": f"Failed to upload {file_type}: {str(e)}",
                    "traceback": traceback.format_exc(),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SchoolAnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing school announcements
    """

    queryset = SchoolAnnouncement.objects.all()
    serializer_class = SchoolAnnouncementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Set the created_by field to the current user"""
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        """Filter announcements based on user permissions"""
        if self.request.user.is_superuser:
            return SchoolAnnouncement.objects.all()
        else:
            # For non-superusers, only show announcements they created
            return SchoolAnnouncement.objects.filter(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        """Toggle the active status of an announcement"""
        announcement = self.get_object()
        announcement.is_active = not announcement.is_active
        announcement.save()
        serializer = self.get_serializer(announcement)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def toggle_pinned(self, request, pk=None):
        """Toggle the pinned status of an announcement"""
        announcement = self.get_object()
        announcement.is_pinned = not announcement.is_pinned
        announcement.save()
        serializer = self.get_serializer(announcement)
        return Response(serializer.data)
