# fees/urls.py
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from . import views
from .views import StudentFeeViewSet
from rest_framework.routers import DefaultRouter

app_name = "fees"

router = DefaultRouter()
router.register(r'studentfee', StudentFeeViewSet, basename='studentfee')

urlpatterns = []
urlpatterns += router.urls
