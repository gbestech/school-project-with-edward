from django.urls import path
from .views import ParentViewSet
from .views_performance import StudentDetailView
from django.views.decorators.csrf import csrf_exempt

parent_list = csrf_exempt(ParentViewSet.as_view({'get': 'list', 'post': 'create'}))
parent_detail = csrf_exempt(ParentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}))
parent_search = csrf_exempt(ParentViewSet.as_view({'get': 'search'}))
parent_activate = csrf_exempt(ParentViewSet.as_view({'post': 'activate'}))
parent_deactivate = csrf_exempt(ParentViewSet.as_view({'post': 'deactivate'}))
parent_add_student = csrf_exempt(ParentViewSet.as_view({'post': 'add_student'}))
parent_add_existing_student = csrf_exempt(ParentViewSet.as_view({'post': 'add_existing_student'}))

urlpatterns = [
    path('', parent_list, name='parent-list'),
    path('<int:pk>/', parent_detail, name='parent-detail'),
    path('search/', parent_search, name='parent-search'),
    path('<int:pk>/activate/', parent_activate, name='parent-activate'),
    path('<int:pk>/deactivate/', parent_deactivate, name='parent-deactivate'),
    path('<int:pk>/add-student/', parent_add_student, name='parent-add-student'),
    path('<int:pk>/add-existing-student/', parent_add_existing_student, name='parent-add-existing-student'),
    path(
        "students/<int:student_id>/", StudentDetailView.as_view(), name="student-detail"
    ),
]
