from rest_framework import viewsets, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
import datetime
import logging

from utils.section_filtering import AutoSectionFilterMixin, SectionFilterMixin
from students.models import Student
from teacher.models import Teacher
from classroom.models import Classroom
from parent.models import ParentProfile, Message
from attendance.models import Attendance

logger = logging.getLogger(__name__)


class DashboardViewSet(AutoSectionFilterMixin, viewsets.ViewSet):
    """
    Dashboard statistics with automatic section filtering
    """

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """
        Get dashboard statistics filtered by section access
        """
        user = request.user
        role = self.get_user_role()
        allowed_education_levels = self.get_user_education_level_access()

        logger.info(
            f"📊 Dashboard stats requested by {user.username} "
            f"(role: {role}, levels: {allowed_education_levels})"
        )

        # If no access, return zeros
        if not allowed_education_levels:
            logger.warning(f"❌ No education level access for {user.username}")
            return Response(
                {
                    "total_students": 0,
                    "active_students": 0,
                    "inactive_students": 0,
                    "total_teachers": 0,
                    "active_teachers": 0,
                    "inactive_teachers": 0,
                    "total_classes": 0,
                    "total_messages": 0,
                    "total_parents": 0,
                    "active_parents": 0,
                    "inactive_parents": 0,
                    "attendance_today": 0,
                    "user_role": role,
                    "access_levels": allowed_education_levels,
                }
            )

        try:
            # === Apply automatic filtering using the mixin ===
            students_queryset = self.apply_section_filters(Student.objects.all())
            classrooms_queryset = self.apply_section_filters(Classroom.objects.all())
            teachers_queryset = self.apply_section_filters(Teacher.objects.all())
            parents_queryset = self.apply_section_filters(ParentProfile.objects.all())
            messages_queryset = self.apply_section_filters(Message.objects.all())
            attendance_queryset = self.apply_section_filters(Attendance.objects.all())

            # Compile statistics
            stats = {
                "total_students": students_queryset.count(),
                "active_students": students_queryset.filter(is_active=True).count(),
                "inactive_students": students_queryset.filter(is_active=False).count(),
                "total_teachers": teachers_queryset.count(),
                "active_teachers": teachers_queryset.filter(is_active=True).count(),
                "inactive_teachers": teachers_queryset.filter(is_active=False).count(),
                "total_classes": classrooms_queryset.count(),
                "total_messages": messages_queryset.count(),
                "total_parents": parents_queryset.count(),
                "active_parents": parents_queryset.filter(user__is_active=True).count(),
                "inactive_parents": parents_queryset.filter(
                    user__is_active=False
                ).count(),
                "attendance_today": attendance_queryset.filter(
                    date=datetime.date.today()
                ).count(),
                # Metadata
                "user_role": role,
                "access_levels": allowed_education_levels,
            }

            logger.info(
                f"✅ Dashboard stats: Students={stats['total_students']}, "
                f"Teachers={stats['total_teachers']}, Classes={stats['total_classes']}"
            )

            return Response(stats)

        except Exception as e:
            logger.error(f"❌ Error getting dashboard stats: {str(e)}", exc_info=True)
            return Response(
                {
                    "error": str(e),
                    "total_students": 0,
                    "active_students": 0,
                    "inactive_students": 0,
                    "total_teachers": 0,
                    "active_teachers": 0,
                    "inactive_teachers": 0,
                    "total_classes": 0,
                    "total_messages": 0,
                    "total_parents": 0,
                    "active_parents": 0,
                    "inactive_parents": 0,
                    "attendance_today": 0,
                }
            )


# === TEACHER LIST VIEW ===
class TeacherViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """
    Teacher ViewSet with automatic section filtering.
    Section admins only see teachers in their sections.
    """

    queryset = Teacher.objects.all()
    permission_classes = [IsAuthenticated]
    # serializer_class = TeacherSerializer  # Add your serializer

    # That's it! AutoSectionFilterMixin automatically filters get_queryset()
    # No need to override get_queryset() - the mixin does it automatically


# === PARENT LIST VIEW ===
class ParentViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """
    Parent ViewSet with automatic section filtering.
    Section admins only see parents whose children are in their sections.
    """

    queryset = ParentProfile.objects.all()
    permission_classes = [IsAuthenticated]
    # serializer_class = ParentSerializer  # Add your serializer

    # AutoSectionFilterMixin handles everything automatically!


# === CLASSROOM LIST VIEW ===
class ClassroomViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """
    Classroom ViewSet with automatic section filtering.
    Section admins only see classrooms in their sections.
    """

    queryset = Classroom.objects.all()
    permission_classes = [IsAuthenticated]
    # serializer_class = ClassroomSerializer  # Add your serializer

    # AutoSectionFilterMixin handles everything automatically!


# === STUDENT LIST VIEW ===
class StudentViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """
    Student ViewSet with automatic section filtering.
    """

    queryset = Student.objects.all()
    permission_classes = [IsAuthenticated]
    # serializer_class = StudentSerializer  # Add your serializer


# === MESSAGE LIST VIEW ===
class MessageViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
    """
    Message ViewSet with automatic section filtering.
    """

    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]
    # serializer_class = MessageSerializer  # Add your serializer


# ============================================================================
# OPTION 2: FUNCTION-BASED VIEWS (If you prefer @api_view)
# ============================================================================

from rest_framework.decorators import api_view, permission_classes
from utils.section_filtering import SectionFilterMixin


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats_function(request):
    """
    Dashboard statistics - Function-based view version
    Uses SectionFilterMixin manually
    """

    # Create mixin instance
    class TempFilter(SectionFilterMixin):
        def __init__(self, request):
            self.request = request

    filter_helper = TempFilter(request)

    # Get role and access levels
    role = filter_helper.get_user_role()
    allowed_levels = filter_helper.get_user_education_level_access()

    logger.info(f"📊 Dashboard for {request.user.username} (role: {role})")

    if not allowed_levels:
        return Response(
            {
                "total_students": 0,
                "total_teachers": 0,
                "total_classes": 0,
                "total_parents": 0,
                "total_messages": 0,
                "user_role": role,
                "access_levels": [],
            }
        )

    try:
        # Apply filtering manually
        students = filter_helper.apply_section_filters(Student.objects.all())
        teachers = filter_helper.apply_section_filters(Teacher.objects.all())
        classrooms = filter_helper.apply_section_filters(Classroom.objects.all())
        parents = filter_helper.apply_section_filters(ParentProfile.objects.all())
        messages = filter_helper.apply_section_filters(Message.objects.all())
        attendance = filter_helper.apply_section_filters(Attendance.objects.all())

        return Response(
            {
                "total_students": students.count(),
                "active_students": students.filter(is_active=True).count(),
                "inactive_students": students.filter(is_active=False).count(),
                "total_teachers": teachers.count(),
                "active_teachers": teachers.filter(is_active=True).count(),
                "inactive_teachers": teachers.filter(is_active=False).count(),
                "total_classes": classrooms.count(),
                "total_parents": parents.count(),
                "active_parents": parents.filter(user__is_active=True).count(),
                "inactive_parents": parents.filter(user__is_active=False).count(),
                "total_messages": messages.count(),
                "attendance_today": attendance.filter(
                    date=datetime.date.today()
                ).count(),
                "user_role": role,
                "access_levels": allowed_levels,
            }
        )

    except Exception as e:
        logger.error(f"❌ Error: {str(e)}", exc_info=True)
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_list_function(request):
    """Get filtered teacher list"""

    class TempFilter(SectionFilterMixin):
        def __init__(self, request):
            self.request = request

    filter_helper = TempFilter(request)
    teachers = filter_helper.apply_section_filters(Teacher.objects.all())

    # Serialize and return
    # teacher_data = TeacherSerializer(teachers, many=True).data
    return Response(
        {
            "count": teachers.count(),
            # "results": teacher_data
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def parent_list_function(request):
    """Get filtered parent list"""

    class TempFilter(SectionFilterMixin):
        def __init__(self, request):
            self.request = request

    filter_helper = TempFilter(request)
    parents = filter_helper.apply_section_filters(ParentProfile.objects.all())

    return Response(
        {
            "count": parents.count(),
            # "results": ParentSerializer(parents, many=True).data
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def classroom_list_function(request):
    """Get filtered classroom list"""

    class TempFilter(SectionFilterMixin):
        def __init__(self, request):
            self.request = request

    filter_helper = TempFilter(request)
    classrooms = filter_helper.apply_section_filters(Classroom.objects.all())

    return Response(
        {
            "count": classrooms.count(),
            # "results": ClassroomSerializer(classrooms, many=True).data
        }
    )


# ============================================================================
# URL CONFIGURATION
# ============================================================================

"""
# For Class-based views (urls.py):
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'parents', ParentViewSet, basename='parent')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = router.urls

# Access dashboard stats at: /api/dashboard/stats/
# Access teachers at: /api/teachers/
# Access parents at: /api/parents/
# etc.
"""

"""
# For Function-based views (urls.py):
from django.urls import path

urlpatterns = [
    path('dashboard/stats/', dashboard_stats_function, name='dashboard-stats'),
    path('teachers/', teacher_list_function, name='teacher-list'),
    path('parents/', parent_list_function, name='parent-list'),
    path('classrooms/', classroom_list_function, name='classroom-list'),
]
"""
