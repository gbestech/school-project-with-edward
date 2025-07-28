from django.urls import path
from .views import ParentViewSet
from .views_performance import StudentDetailView
from django.views.decorators.csrf import csrf_exempt

parent_list = csrf_exempt(ParentViewSet.as_view({'get': 'list', 'post': 'create'}))
parent_detail = csrf_exempt(ParentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}))
parent_search = csrf_exempt(ParentViewSet.as_view({'get': 'search'}))

urlpatterns = [
    path('', parent_list, name='parent-list'),
    path('<int:pk>/', parent_detail, name='parent-detail'),
    path('search/', parent_search, name='parent-search'),
    path(
        "students/<int:student_id>/", StudentDetailView.as_view(), name="student-detail"
    ),
]
