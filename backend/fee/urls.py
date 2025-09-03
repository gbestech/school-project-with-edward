# fees/urls.py
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from . import views
from .views import StudentFeeViewSet, AcademicSessionViewSet, TermViewSet
from rest_framework.routers import DefaultRouter

app_name = "fees"

router = DefaultRouter()
router.register(r'studentfee', StudentFeeViewSet, basename='studentfee')
router.register(r'academic-sessions', AcademicSessionViewSet, basename='academic-session')
router.register(r'terms', TermViewSet, basename='term')

urlpatterns = []
urlpatterns += router.urls
