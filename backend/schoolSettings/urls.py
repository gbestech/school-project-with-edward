from django.urls import path
from . import views

app_name = 'schoolSettings'

urlpatterns = [
    # Main settings endpoints
    path('school-settings/', views.SchoolSettingsDetail.as_view(), name='settings-detail'),
    
    # Payment gateway testing
    path('payment-gateways/<str:gateway>/test/', views.test_payment_gateway, name='test-payment-gateway'),
    
    # Notification testing
    path('notifications/email/test/', views.test_email_connection, name='test-email'),
    path('notifications/sms/test/', views.test_sms_connection, name='test-sms'),
    
    # File uploads
    path('school-settings/upload-logo/', views.FileUploadView.as_view(), {'file_type': 'logo'}, name='upload-logo'),
    path('school-settings/upload-favicon/', views.FileUploadView.as_view(), {'file_type': 'favicon'}, name='upload-favicon'),
] 