# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     LessonViewSet, LessonAttendanceViewSet,
#     LessonResourceViewSet, LessonAssessmentViewSet
# )

# router = DefaultRouter()
# router.register(r'lessons', LessonViewSet, basename='lesson')
# router.register(r'attendances', LessonAttendanceViewSet, basename='lesson-attendance')
# router.register(r'resources', LessonResourceViewSet, basename='lesson-resource')
# router.register(r'assessments', LessonAssessmentViewSet, basename='lesson-assessment')

# urlpatterns = [
#     path('', include(router.urls)),
# ]


from django.urls import path, include
from django.urls import re_path
from rest_framework.routers import DefaultRouter
from .views import (
    LessonViewSet,
    LessonAttendanceViewSet,
    LessonResourceViewSet,
    LessonAssessmentViewSet,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r"lessons", LessonViewSet, basename="lesson")
router.register(r"attendances", LessonAttendanceViewSet, basename="lesson-attendance")
router.register(r"resources", LessonResourceViewSet, basename="lesson-resource")
router.register(r"assessments", LessonAssessmentViewSet, basename="lesson-assessment")

urlpatterns = [
    # Include all router URLs
    path("", include(router.urls)),
    # Fallback direct list/create routes to avoid any router resolution issues
    path(
        "lessons/",
        LessonViewSet.as_view({"get": "list", "post": "create"}),
        name="lesson-list-direct",
    ),
    re_path(r"^lessons$", LessonViewSet.as_view({"get": "list"}), name="lesson-list-direct-noslash"),
    # Backward-compat direct paths for action endpoints under /api/lessons/
    path(
        "teacher_subjects/",
        LessonViewSet.as_view({"get": "teacher_subjects"}),
        name="lesson-teacher-subjects-direct",
    ),
    path(
        "subject_teachers/",
        LessonViewSet.as_view({"get": "subject_teachers"}),
        name="lesson-subject-teachers-direct",
    ),
    path(
        "teacher_classrooms/",
        LessonViewSet.as_view({"get": "teacher_classrooms"}),
        name="lesson-teacher-classrooms-direct",
    ),
    path(
        "classroom_sections/",
        LessonViewSet.as_view({"get": "classroom_sections"}),
        name="lesson-classroom-sections-direct",
    ),
    path(
        "subjects_by_level/",
        LessonViewSet.as_view({"get": "subjects_by_level"}),
        name="lesson-subjects-by-level-direct",
    ),
    path(
        "role_info/",
        LessonViewSet.as_view({"get": "role_info"}),
        name="lesson-role-info-direct",
    ),
    # Role-based lesson endpoints (these are handled by @action decorators in ViewSet)
    # Available endpoints:
    # === LESSON ENDPOINTS ===
    # Standard CRUD (role-filtered automatically)
    # GET    /lessons/                     - List lessons (admin: all, teacher: own only)
    # POST   /lessons/                     - Create lesson (teacher auto-assigned for non-admins)
    # GET    /lessons/{id}/                - Retrieve lesson (role-filtered)
    # PUT    /lessons/{id}/                - Update lesson (role-filtered)
    # PATCH  /lessons/{id}/                - Partial update (role-filtered)
    # DELETE /lessons/{id}/                - Delete lesson (role-filtered)
    # Teacher-specific endpoints
    # GET    /lessons/my_lessons/          - Get current teacher's lessons only
    # Calendar and scheduling
    # GET    /lessons/calendar/            - Calendar view (role-filtered)
    # GET    /lessons/conflicts/           - Check scheduling conflicts
    # Statistics and analytics
    # GET    /lessons/statistics/          - Lesson statistics (role-filtered)
    # Lesson management actions (role-filtered)
    # POST   /lessons/{id}/start_lesson/   - Start a lesson
    # POST   /lessons/{id}/complete_lesson/ - Complete a lesson
    # POST   /lessons/{id}/cancel_lesson/  - Cancel a lesson
    # POST   /lessons/{id}/update_status/  - Update lesson status
    # GET    /lessons/{id}/get_progress/   - Get lesson progress
    # POST   /lessons/{id}/update_progress/ - Update lesson progress
    # Bulk operations
    # POST   /lessons/bulk_create/         - Create multiple lessons
    # Helper endpoints
    # GET    /lessons/teacher_subjects/    - Get subjects for selected teacher
    # GET    /lessons/subject_teachers/    - Get teachers for selected subject
    # GET    /lessons/teacher_classrooms/  - Get classrooms for selected teacher
    # GET    /lessons/classroom_sections/  - Get all classroom sections
    # GET    /lessons/subjects_by_level/   - Get subjects by education level
    # Reports and data
    # GET    /lessons/{id}/download_report/ - Download lesson report
    # GET    /lessons/{id}/enrolled_students/ - Get enrolled students
    # === ATTENDANCE ENDPOINTS (role-filtered) ===
    # GET    /attendances/                 - List attendance (admin: all, teacher: own lessons only)
    # POST   /attendances/                 - Create attendance record
    # GET    /attendances/{id}/            - Retrieve attendance
    # PUT    /attendances/{id}/            - Update attendance
    # DELETE /attendances/{id}/            - Delete attendance
    # === RESOURCE ENDPOINTS (role-filtered) ===
    # GET    /resources/                   - List resources (admin: all, teacher: own lessons only)
    # POST   /resources/                   - Create resource
    # GET    /resources/{id}/              - Retrieve resource
    # PUT    /resources/{id}/              - Update resource
    # DELETE /resources/{id}/              - Delete resource
    # === ASSESSMENT ENDPOINTS (role-filtered) ===
    # GET    /assessments/                 - List assessments (admin: all, teacher: own lessons only)
    # POST   /assessments/                 - Create assessment
    # GET    /assessments/{id}/            - Retrieve assessment
    # PUT    /assessments/{id}/            - Update assessment
    # DELETE /assessments/{id}/            - Delete assessment
]

# Optional: Add custom URL patterns if you want to create dedicated views
# instead of using ViewSet actions

# Example of how to add custom permission-based endpoints:
"""
from .views import AdminLessonListView, TeacherLessonListView

additional_patterns = [
    # Explicit role-based endpoints (if you prefer separate views)
    path('admin/lessons/', AdminLessonListView.as_view(), name='admin-lessons'),
    path('teacher/lessons/', TeacherLessonListView.as_view(), name='teacher-lessons'),
    
    # API documentation endpoints
    path('docs/endpoints/', include('rest_framework.urls')),
]

urlpatterns += additional_patterns
"""

# URL naming convention used by the router:
# - lesson-list, lesson-detail, lesson-create, etc.
# - lesson-attendance-list, lesson-attendance-detail, etc.
# - lesson-resource-list, lesson-resource-detail, etc.
# - lesson-assessment-list, lesson-assessment-detail, etc.

# Available URL names for reverse lookups:
URL_NAMES = {
    # Lesson URLs
    "lesson-list": "lessons/",
    "lesson-detail": "lessons/{id}/",
    "lesson-my-lessons": "lessons/my_lessons/",
    "lesson-calendar": "lessons/calendar/",
    "lesson-statistics": "lessons/statistics/",
    "lesson-conflicts": "lessons/conflicts/",
    "lesson-bulk-create": "lessons/bulk_create/",
    "lesson-start-lesson": "lessons/{id}/start_lesson/",
    "lesson-complete-lesson": "lessons/{id}/complete_lesson/",
    "lesson-cancel-lesson": "lessons/{id}/cancel_lesson/",
    "lesson-update-status": "lessons/{id}/update_status/",
    "lesson-get-progress": "lessons/{id}/get_progress/",
    "lesson-update-progress": "lessons/{id}/update_progress/",
    "lesson-teacher-subjects": "lessons/teacher_subjects/",
    "lesson-subject-teachers": "lessons/subject_teachers/",
    "lesson-teacher-classrooms": "lessons/teacher_classrooms/",
    "lesson-classroom-sections": "lessons/classroom_sections/",
    "lesson-subjects-by-level": "lessons/subjects_by_level/",
    "lesson-download-report": "lessons/{id}/download_report/",
    "lesson-enrolled-students": "lessons/{id}/enrolled_students/",
    # Attendance URLs
    "lesson-attendance-list": "attendances/",
    "lesson-attendance-detail": "attendances/{id}/",
    # Resource URLs
    "lesson-resource-list": "resources/",
    "lesson-resource-detail": "resources/{id}/",
    # Assessment URLs
    "lesson-assessment-list": "assessments/",
    "lesson-assessment-detail": "assessments/{id}/",
}

# Example usage in templates or views:
"""
from django.urls import reverse

# Get URL for lesson list
lesson_list_url = reverse('lesson-list')

# Get URL for specific lesson
lesson_detail_url = reverse('lesson-detail', kwargs={'pk': lesson_id})

# Get URL for teacher's lessons
my_lessons_url = reverse('lesson-my-lessons')
"""

# Filtering parameters available on list endpoints:
AVAILABLE_FILTERS = {
    "lessons": {
        "query_params": [
            "status",
            "lesson_type",
            "difficulty_level",
            "date",
            "date__gte",
            "date__lte",
            "teacher_id",
            "classroom_id",
            "subject_id",
            "is_recurring",
            "requires_special_equipment",
            "is_online_lesson",
            "is_active",
            "completion_percentage",
            "completion_percentage__gte",
            "completion_percentage__lte",
        ],
        "search_fields": [
            "title",
            "description",
            "teacher__user__first_name",
            "teacher__user__last_name",
            "classroom__name",
            "subject__name",
            "teacher_notes",
            "lesson_notes",
        ],
        "ordering_fields": [
            "date",
            "start_time",
            "title",
            "status",
            "completion_percentage",
            "created_at",
            "updated_at",
        ],
        "custom_filters": ["date_filter", "status_filter", "stream_filter"],
    },
    "attendances": {
        "query_params": ["lesson_id", "student_id", "status"],
        "search_fields": [
            "student__user__first_name",
            "student__user__last_name",
            "notes",
        ],
    },
    "resources": {
        "query_params": ["lesson_id", "resource_type", "is_required"],
        "search_fields": ["title", "description"],
    },
    "assessments": {
        "query_params": ["lesson_id", "assessment_type", "due_date"],
        "search_fields": ["title", "description"],
        "ordering_fields": ["due_date", "total_points", "weight_percentage"],
    },
}

# Example API calls:
"""
# Get all lessons for current user (admin sees all, teacher sees own)
GET /api/lessons/

# Get lessons with filters
GET /api/lessons/?status=scheduled&date__gte=2024-01-01&search=math

# Get teacher's own lessons (convenience endpoint)
GET /api/lessons/my_lessons/

# Get calendar view
GET /api/lessons/calendar/?start_date=2024-01-01&end_date=2024-01-31

# Get statistics (role-based)
GET /api/lessons/statistics/

# Start a lesson (only if user owns it or is admin)
POST /api/lessons/123/start_lesson/

# Create lesson (teacher auto-assigned for non-admins)
POST /api/lessons/
{
    "title": "Math Lesson",
    "classroom_id": 1,
    "subject_id": 1,
    "date": "2024-01-15",
    "start_time": "09:00",
    "end_time": "10:00"
}

# Get attendance for lessons user has access to
GET /api/attendances/?lesson_id=123
"""
