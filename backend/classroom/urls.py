from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GradeLevelViewSet,
    SectionViewSet,
    AcademicYearViewSet,
    TermViewSet,
    TeacherViewSet,
    StudentViewSet,
    SubjectViewSet,
    ClassroomViewSet,
    ClassroomTeacherAssignmentViewSet,
    StudentEnrollmentViewSet,
    ClassScheduleViewSet,
)

router = DefaultRouter()

# Academic Structure
router.register(r"academic-years", AcademicYearViewSet, basename="academicyear")
router.register(r"terms", TermViewSet, basename="term")
router.register(r"grades", GradeLevelViewSet, basename="gradelevel")
router.register(r"sections", SectionViewSet, basename="section")
router.register(r"subjects", SubjectViewSet, basename="subject")

# People Management
router.register(r"teachers", TeacherViewSet, basename="teacher")
router.register(r"students", StudentViewSet, basename="student")

# Classroom Management
router.register(r"classrooms", ClassroomViewSet, basename="classroom")
router.register(
    r"teacher-assignments",
    ClassroomTeacherAssignmentViewSet,
    basename="teacherassignment",
)
router.register(
    r"student-enrollments", StudentEnrollmentViewSet, basename="studentenrollment"
)

# Scheduling
router.register(r"schedules", ClassScheduleViewSet, basename="classschedule")

urlpatterns = [
    path("", include(router.urls)),
    # Custom endpoints for common operations
    path(
        "classrooms/<int:classroom_id>/students/",
        ClassroomViewSet.as_view({"get": "students"}),
        name="classroom-students",
    ),
    path(
        "classrooms/<int:classroom_id>/teachers/",
        ClassroomViewSet.as_view({"get": "teachers"}),
        name="classroom-teachers",
    ),
    path(
        "students/<int:student_id>/current-class/",
        StudentViewSet.as_view({"get": "current_class"}),
        name="student-current-class",
    ),
    path(
        "teachers/<int:teacher_id>/classes/",
        TeacherViewSet.as_view({"get": "classes"}),
        name="teacher-classes",
    ),
    path(
        "academic-years/current/",
        AcademicYearViewSet.as_view({"get": "current"}),
        name="current-academic-year",
    ),
]
