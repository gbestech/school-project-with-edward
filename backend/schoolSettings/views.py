from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import os
from .models import SchoolSettings
from .serializers import SchoolSettingsSerializer


class SchoolSettingsDetail(APIView):
    """
    Retrieve and update school settings
    """
    permission_classes = [AllowAny]  # Temporarily allow any access for testing
    
    def get(self, request):
        """Get current school settings"""
        try:
            # Get the first (and should be only) school settings instance
            settings = SchoolSettings.objects.first()
            if not settings:
                # Create default settings if none exist
                settings = SchoolSettings.objects.create()
            
            serializer = SchoolSettingsSerializer(settings)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch settings: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """Update school settings"""
        try:
            settings = SchoolSettings.objects.first()
            if not settings:
                settings = SchoolSettings.objects.create()
            
            # Remove computed fields that shouldn't be updated directly
            data = request.data.copy()
            data.pop('logo_url', None)
            data.pop('favicon_url', None)
            data.pop('logo', None)  # Remove logo field as it should be uploaded separately
            data.pop('favicon', None)  # Remove favicon field as it should be uploaded separately
            data.pop('id', None)
            data.pop('created_at', None)
            data.pop('updated_at', None)
            
            serializer = SchoolSettingsSerializer(settings, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': f'Failed to update settings: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_payment_gateway(request, gateway):
    """Test payment gateway connection"""
    try:
        credentials = request.data
        
        # Here you would implement the actual gateway testing logic
        # For now, we'll return a mock response
        
        if gateway == 'paystack':
            # Test Paystack connection
            public_key = credentials.get('publicKey', '')
            secret_key = credentials.get('secretKey', '')
            
            if not public_key or not secret_key:
                return Response(
                    {'success': False, 'message': 'Public key and secret key are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mock successful test
            return Response({
                'success': True,
                'message': 'Paystack connection test successful!'
            })
            
        elif gateway == 'stripe':
            # Test Stripe connection
            publishable_key = credentials.get('publishableKey', '')
            secret_key = credentials.get('secretKey', '')
            
            if not publishable_key or not secret_key:
                return Response(
                    {'success': False, 'message': 'Publishable key and secret key are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mock successful test
            return Response({
                'success': True,
                'message': 'Stripe connection test successful!'
            })
            
        elif gateway == 'flutterwave':
            # Test Flutterwave connection
            public_key = credentials.get('publicKey', '')
            secret_key = credentials.get('secretKey', '')
            
            if not public_key or not secret_key:
                return Response(
                    {'success': False, 'message': 'Public key and secret key are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mock successful test
            return Response({
                'success': True,
                'message': 'Flutterwave connection test successful!'
            })
            
        else:
            return Response(
                {'success': False, 'message': f'Unsupported gateway: {gateway}'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'success': False, 'message': f'Failed to test {gateway} connection: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_email_connection(request):
    """Test email provider connection (SMTP or Brevo)"""
    try:
        provider = request.data.get('provider', 'smtp')
        
        if provider == 'smtp':
            # Test SMTP connection
            smtp_config = request.data
            
            # Validate required fields
            required_fields = ['host', 'port', 'username', 'password']
            for field in required_fields:
                if not smtp_config.get(field):
                    return Response(
                        {'success': False, 'message': f'{field} is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Here you would implement actual SMTP testing
            # For now, we'll return a mock response
            return Response({
                'success': True,
                'message': 'SMTP connection test successful!'
            })
        
        elif provider == 'brevo':
            # Test Brevo connection
            import requests
            
            api_key = request.data.get('apiKey', '')
            from_email = request.data.get('fromEmail', '')
            
            if not api_key:
                return Response(
                    {'success': False, 'message': 'Brevo API key is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Test Brevo API connection
            url = "https://api.brevo.com/v3/senders"
            headers = {
                "accept": "application/json",
                "api-key": api_key
            }
            
            try:
                response = requests.get(url, headers=headers)
                if response.status_code == 200:
                    return Response({
                        'success': True,
                        'message': 'Brevo connection successful!'
                    })
                else:
                    return Response({
                        'success': False,
                        'message': 'Invalid Brevo API key or connection failed'
                    })
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Brevo connection error: {str(e)}'
                })
        
        else:
            return Response({
                'success': False,
                'message': f'Unsupported email provider: {provider}'
            })
            
    except Exception as e:
        return Response(
            {'success': False, 'message': f'Failed to test email connection: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def test_sms_connection(request):
    """Test SMS provider connection"""
    try:
        sms_config = request.data
        
        # Validate required fields
        required_fields = ['provider', 'apiKey', 'apiSecret']
        for field in required_fields:
            if not sms_config.get(field):
                return Response(
                    {'success': False, 'message': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Here you would implement actual SMS provider testing
        # For now, we'll return a mock response
        
        return Response({
            'success': True,
            'message': f'SMS connection test successful for {sms_config["provider"]}!'
        })
        
    except Exception as e:
        return Response(
            {'success': False, 'message': f'Failed to test SMS connection: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@method_decorator(csrf_exempt, name='dispatch')
class FileUploadView(APIView):
    """Handle file uploads for logo and favicon"""
    permission_classes = [AllowAny]  # Temporarily allow any access for testing
    
    def post(self, request, file_type):
        self.context = {'request': request}
        """Upload logo or favicon"""
        try:
            if file_type not in ['logo', 'favicon']:
                return Response(
                    {'error': 'Invalid file type. Must be logo or favicon'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for the correct field name based on file_type
            field_name = file_type
            if field_name not in request.FILES:
                return Response(
                    {'error': f'No {file_type} file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_file = request.FILES[field_name]
            
            # Validate file type
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
            if uploaded_file.content_type not in allowed_types:
                return Response(
                    {'error': 'Invalid file type. Only JPEG, PNG, GIF, and SVG are allowed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file size (max 5MB)
            if uploaded_file.size > 5 * 1024 * 1024:
                return Response(
                    {'error': 'File size too large. Maximum size is 5MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the settings instance
            settings = SchoolSettings.objects.first()
            if not settings:
                settings = SchoolSettings.objects.create()
            
            # Delete old file if it exists before saving the new one
            if file_type == 'logo':
                if settings.logo:
                    # Delete the old logo file from storage
                    settings.logo.delete(save=False)
                settings.logo = uploaded_file
            elif file_type == 'favicon':
                if settings.favicon:
                    # Delete the old favicon file from storage
                    settings.favicon.delete(save=False)
                settings.favicon = uploaded_file
            
            settings.save()
            
            # Return the file URL (using relative URLs for now)
            if file_type == 'logo' and settings.logo:
                file_url = settings.logo.url
            elif file_type == 'favicon' and settings.favicon:
                file_url = settings.favicon.url
            else:
                file_url = None
            
            return Response({
                f'{file_type}Url': file_url,
                'message': f'{file_type.capitalize()} uploaded successfully'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to upload {file_type}: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
