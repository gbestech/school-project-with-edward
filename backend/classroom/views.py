from django.shortcuts import render
from django.db import models
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from teacher.models import Teacher

from .models import (
    GradeLevel,
    Section,
    AcademicYear,
    Term,
    Student,
    Subject,
    Classroom,
    ClassroomTeacherAssignment,
    StudentEnrollment,
    ClassSchedule,
)
from .serializers import (
    GradeLevelSerializer,
    SectionSerializer,
    AcademicYearSerializer,
    TermSerializer,
    TeacherSerializer,
    StudentSerializer,
    SubjectSerializer,
    ClassroomSerializer,
    ClassroomDetailSerializer,
    ClassroomTeacherAssignmentSerializer,
    StudentEnrollmentSerializer,
    ClassScheduleSerializer,
    # Simple serializers
    GradeLevelSimpleSerializer,
    SectionSimpleSerializer,
    TeacherSimpleSerializer,
    StudentSimpleSerializer,
    SubjectSimpleSerializer,
    ClassroomSimpleSerializer,
    # Bulk operations
    BulkStudentEnrollmentSerializer,
)


# Custom Filters
class GradeLevelFilter(django_filters.FilterSet):
    education_level = django_filters.ChoiceFilter(choices=GradeLevel.EDUCATION_LEVELS)
    is_active = django_filters.BooleanFilter()
    has_sections = django_filters.BooleanFilter(method="filter_has_sections")

    class Meta:
        model = GradeLevel
        fields = ["education_level", "is_active"]

    def filter_has_sections(self, queryset, name, value):
        if value:
            return queryset.filter(sections__isnull=False).distinct()
        return queryset.filter(sections__isnull=True)


class SectionFilter(django_filters.FilterSet):
    grade_level = django_filters.ModelChoiceFilter(queryset=GradeLevel.objects.all())
    education_level = django_filters.ChoiceFilter(
        field_name="grade_level__education_level", choices=GradeLevel.EDUCATION_LEVELS
    )
    is_active = django_filters.BooleanFilter()
    has_classrooms = django_filters.BooleanFilter(method="filter_has_classrooms")

    class Meta:
        model = Section
        fields = ["grade_level", "is_active"]

    def filter_has_classrooms(self, queryset, name, value):
        if value:
            return queryset.filter(classrooms__isnull=False).distinct()
        return queryset.filter(classrooms__isnull=True)


class TeacherFilter(django_filters.FilterSet):
    specialization = django_filters.CharFilter(lookup_expr="icontains")
    hire_date_from = django_filters.DateFilter(
        field_name="hire_date", lookup_expr="gte"
    )
    hire_date_to = django_filters.DateFilter(field_name="hire_date", lookup_expr="lte")
    is_active = django_filters.BooleanFilter()
    has_classes = django_filters.BooleanFilter(method="filter_has_classes")

    class Meta:
        model = Teacher
        fields = ["specialization", "is_active"]

    def filter_has_classes(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(primary_classes__isnull=False) | Q(assigned_classes__isnull=False)
            ).distinct()
        return queryset.exclude(
            Q(primary_classes__isnull=False) | Q(assigned_classes__isnull=False)
        )


class StudentFilter(django_filters.FilterSet):
    gender = django_filters.ChoiceFilter(choices=Student.GENDER_CHOICES)
    admission_date_from = django_filters.DateFilter(
        field_name="admission_date", lookup_expr="gte"
    )
    admission_date_to = django_filters.DateFilter(
        field_name="admission_date", lookup_expr="lte"
    )
    is_active = django_filters.BooleanFilter()
    has_enrollment = django_filters.BooleanFilter(method="filter_has_enrollment")
    age_min = django_filters.NumberFilter(method="filter_age_min")
    age_max = django_filters.NumberFilter(method="filter_age_max")

    class Meta:
        model = Student
        fields = ["gender", "is_active"]

    def filter_has_enrollment(self, queryset, name, value):
        if value:
            return queryset.filter(enrolled_classes__isnull=False).distinct()
        return queryset.filter(enrolled_classes__isnull=True)

    def filter_age_min(self, queryset, name, value):
        # This is a simplified age filter - in production, you'd want more precise date calculations
        cutoff_date = timezone.now().date().replace(year=timezone.now().year - value)
        return queryset.filter(date_of_birth__lte=cutoff_date)

    def filter_age_max(self, queryset, name, value):
        cutoff_date = timezone.now().date().replace(year=timezone.now().year - value)
        return queryset.filter(date_of_birth__gte=cutoff_date)


class ClassroomFilter(django_filters.FilterSet):
    section = django_filters.ModelChoiceFilter(queryset=Section.objects.all())
    grade_level = django_filters.ModelChoiceFilter(
        field_name="section__grade_level", queryset=GradeLevel.objects.all()
    )
    education_level = django_filters.ChoiceFilter(
        field_name="section__grade_level__education_level",
        choices=GradeLevel.EDUCATION_LEVELS,
    )
    academic_year = django_filters.ModelChoiceFilter(
        queryset=AcademicYear.objects.all()
    )
    term = django_filters.ModelChoiceFilter(queryset=Term.objects.all())
    class_teacher = django_filters.ModelChoiceFilter(queryset=Teacher.objects.all())
    is_active = django_filters.BooleanFilter()
    has_capacity = django_filters.BooleanFilter(method="filter_has_capacity")
    is_full = django_filters.BooleanFilter(method="filter_is_full")

    class Meta:
        model = Classroom
        fields = ["section", "academic_year", "term", "class_teacher", "is_active"]

    def filter_has_capacity(self, queryset, name, value):
        if value:
            return queryset.annotate(
                enrollment_count=Count(
                    "students", filter=Q(studentenrollment__is_active=True)
                )
            ).filter(enrollment_count__lt=models.F("max_capacity"))
        return queryset.annotate(
            enrollment_count=Count(
                "students", filter=Q(studentenrollment__is_active=True)
            )
        ).filter(enrollment_count__gte=models.F("max_capacity"))

    def filter_is_full(self, queryset, name, value):
        return self.filter_has_capacity(queryset, name, not value)


# ViewSets
class GradeLevelViewSet(viewsets.ModelViewSet):
    queryset = GradeLevel.objects.all().prefetch_related("sections")
    serializer_class = GradeLevelSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = GradeLevelFilter
    search_fields = ["name", "description"]
    ordering_fields = ["name", "education_level", "order", "created_at"]
    ordering = ["education_level", "order"]

    def get_serializer_class(self):
        if self.action == "list" and self.request.query_params.get("simple"):
            return GradeLevelSimpleSerializer
        return self.serializer_class

    @action(detail=False, methods=["get"])
    def by_education_level(self, request):
        """Get grade levels grouped by education level"""
        education_levels = GradeLevel.EDUCATION_LEVELS
        result = {}

        for level_code, level_name in education_levels:
            grade_levels = self.get_queryset().filter(
                education_level=level_code, is_active=True
            )
            result[level_code] = {
                "name": level_name,
                "grade_levels": GradeLevelSimpleSerializer(
                    grade_levels, many=True
                ).data,
            }

        return Response(result)

    @action(detail=True, methods=["get"])
    def sections(self, request, pk=None):
        """Get all sections for a specific grade level"""
        grade_level = self.get_object()
        sections = grade_level.sections.filter(is_active=True)
        serializer = SectionSimpleSerializer(sections, many=True)
        return Response(serializer.data)


class SectionViewSet(viewsets.ModelViewSet):
    queryset = (
        Section.objects.all()
        .select_related("grade_level")
        .prefetch_related("classrooms")
    )
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = SectionFilter
    search_fields = ["name", "grade_level__name"]
    ordering_fields = ["name", "grade_level__name", "created_at"]
    ordering = ["grade_level__education_level", "grade_level__order", "name"]

    def get_serializer_class(self):
        if self.action == "list" and self.request.query_params.get("simple"):
            return SectionSimpleSerializer
        return self.serializer_class

    @action(detail=True, methods=["get"])
    def classrooms(self, request, pk=None):
        """Get all classrooms for a specific section"""
        section = self.get_object()
        classrooms = section.classrooms.filter(is_active=True)
        serializer = ClassroomSimpleSerializer(classrooms, many=True)
        return Response(serializer.data)


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all().prefetch_related("terms", "classrooms")
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_current", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["name", "start_date", "created_at"]
    ordering = ["-start_date"]

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get the current academic year"""
        try:
            current_year = AcademicYear.objects.get(is_current=True)
            serializer = self.get_serializer(current_year)
            return Response(serializer.data)
        except AcademicYear.DoesNotExist:
            return Response(
                {"error": "No current academic year set"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"])
    def set_current(self, request, pk=None):
        """Set this academic year as current"""
        if not request.user.is_staff:
            return Response(
                {"error": "Only staff can set current academic year"},
                status=status.HTTP_403_FORBIDDEN,
            )

        academic_year = self.get_object()
        # Unset current flag for all other years
        AcademicYear.objects.update(is_current=False)
        # Set current flag for this year
        academic_year.is_current = True
        academic_year.save()

        return Response(
            {"message": f"{academic_year.name} set as current academic year"}
        )


class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all().select_related("academic_year")
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["academic_year", "name", "is_current", "is_active"]
    search_fields = ["academic_year__name"]
    ordering_fields = ["academic_year__start_date", "name", "start_date"]
    ordering = ["academic_year__start_date", "name"]

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get the current term"""
        try:
            current_term = Term.objects.get(is_current=True)
            serializer = self.get_serializer(current_term)
            return Response(serializer.data)
        except Term.DoesNotExist:
            return Response(
                {"error": "No current term set"}, status=status.HTTP_404_NOT_FOUND
            )


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = (
        Teacher.objects.all()
        .select_related("user")
        .prefetch_related("primary_classes", "assigned_classes")
    )
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = TeacherFilter
    search_fields = [
        "user__first_name",
        "user__last_name",
        "employee_id",
        "specialization",
    ]
    ordering_fields = ["user__first_name", "employee_id", "hire_date", "created_at"]
    ordering = ["user__first_name", "user__last_name"]

    def get_serializer_class(self):
        if self.action == "list" and self.request.query_params.get("simple"):
            return TeacherSimpleSerializer
        return self.serializer_class

    @action(detail=True, methods=["get"])
    def classes(self, request, pk=None):
        """Get all classes assigned to a teacher"""
        teacher = self.get_object()
        primary_classes = teacher.primary_classes.filter(is_active=True)
        assigned_classes = teacher.assigned_classes.filter(is_active=True)

        return Response(
            {
                "primary_classes": ClassroomSimpleSerializer(
                    primary_classes, many=True
                ).data,
                "assigned_classes": ClassroomSimpleSerializer(
                    assigned_classes, many=True
                ).data,
            }
        )

    @action(detail=True, methods=["get"])
    def schedule(self, request, pk=None):
        """Get teacher's schedule"""
        teacher = self.get_object()
        schedules = ClassSchedule.objects.filter(
            teacher=teacher, is_active=True
        ).select_related("classroom", "subject")

        serializer = ClassScheduleSerializer(schedules, many=True)
        return Response(serializer.data)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().prefetch_related("enrolled_classes")
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = StudentFilter
    search_fields = ["first_name", "last_name", "admission_number", "guardian_name"]
    ordering_fields = ["first_name", "last_name", "admission_number", "admission_date"]
    ordering = ["first_name", "last_name"]

    def get_serializer_class(self):
        if self.action == "list" and self.request.query_params.get("simple"):
            return StudentSimpleSerializer
        return self.serializer_class

    @action(detail=True, methods=["get"])
    def enrollment_history(self, request, pk=None):
        """Get student's enrollment history"""
        student = self.get_object()
        enrollments = StudentEnrollment.objects.filter(student=student).select_related(
            "classroom__section__grade_level", "classroom__academic_year"
        )

        serializer = StudentEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def without_enrollment(self, request):
        """Get students without current enrollment"""
        students = Student.objects.filter(is_active=True).exclude(
            enrolled_classes__studentenrollment__is_active=True
        )

        serializer = self.get_serializer(students, many=True)
        return Response(serializer.data)


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().prefetch_related("grade_levels")
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_core", "is_active", "grade_levels"]
    search_fields = ["name", "code", "description"]
    ordering_fields = ["name", "code", "created_at"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action == "list" and self.request.query_params.get("simple"):
            return SubjectSimpleSerializer
        return self.serializer_class

    @action(detail=False, methods=["get"])
    def by_grade_level(self, request):
        """Get subjects grouped by grade level"""
        grade_level_id = request.query_params.get("grade_level")
        if not grade_level_id:
            return Response(
                {"error": "grade_level parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subjects = self.get_queryset().filter(
            grade_levels__id=grade_level_id, is_active=True
        )
        serializer = SubjectSimpleSerializer(subjects, many=True)
        return Response(serializer.data)


class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = (
        Classroom.objects.all()
        .select_related(
            "section__grade_level", "academic_year", "term", "class_teacher__user"
        )
        .prefetch_related("students", "subject_teachers")
    )
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ClassroomFilter
    search_fields = [
        "name",
        "section__name",
        "section__grade_level__name",
        "room_number",
    ]
    ordering_fields = [
        "name",
        "section__name",
        "academic_year__start_date",
        "created_at",
    ]
    ordering = [
        "section__grade_level__education_level",
        "section__grade_level__order",
        "section__name",
    ]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ClassroomDetailSerializer
        if self.action == "list" and self.request.query_params.get("simple"):
            return ClassroomSimpleSerializer
        return self.serializer_class

    @action(detail=True, methods=["post"])
    def enroll_student(self, request, pk=None):
        """Enroll a single student in the classroom"""
        classroom = self.get_object()
        student_id = request.data.get("student_id")

        if not student_id:
            return Response(
                {"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(id=student_id, is_active=True)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if classroom is full
        if classroom.is_full:
            return Response(
                {"error": "Classroom is at maximum capacity"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if student is already enrolled
        if StudentEnrollment.objects.filter(
            student=student, classroom=classroom, is_active=True
        ).exists():
            return Response(
                {"error": "Student is already enrolled in this classroom"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create enrollment
        enrollment = StudentEnrollment.objects.create(
            student=student, classroom=classroom, enrollment_date=timezone.now().date()
        )

        serializer = StudentEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def bulk_enroll_students(self, request, pk=None):
        """Enroll multiple students in the classroom"""
        classroom = self.get_object()
        serializer = BulkStudentEnrollmentSerializer(data=request.data)

        if serializer.is_valid():
            student_ids = serializer.validated_data["student_ids"]
            enrollment_date = serializer.validated_data["enrollment_date"]

            # Check capacity
            available_spots = classroom.available_spots
            if len(student_ids) > available_spots:
                return Response(
                    {
                        "error": f"Not enough capacity. Available spots: {available_spots}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check for existing enrollments
            existing_enrollments = StudentEnrollment.objects.filter(
                student_id__in=student_ids, classroom=classroom, is_active=True
            ).values_list("student_id", flat=True)

            if existing_enrollments:
                return Response(
                    {
                        "error": f"Students already enrolled: {list(existing_enrollments)}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create enrollments
            enrollments = []
            for student_id in student_ids:
                enrollments.append(
                    StudentEnrollment(
                        student_id=student_id,
                        classroom=classroom,
                        enrollment_date=enrollment_date,
                    )
                )

            StudentEnrollment.objects.bulk_create(enrollments)

            return Response(
                {
                    "message": f"Successfully enrolled {len(student_ids)} students",
                    "enrolled_count": len(student_ids),
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def available_students(self, request, pk=None):
        """Get students available for enrollment (not currently enrolled)"""
        classroom = self.get_object()

        # Get students not enrolled in any active classroom
        available_students = Student.objects.filter(is_active=True).exclude(
            enrolled_classes__studentenrollment__is_active=True
        )

        serializer = StudentSimpleSerializer(available_students, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def statistics(self, request, pk=None):
        """Get classroom statistics"""
        classroom = self.get_object()

        # Student statistics
        students = classroom.students.filter(studentenrollment__is_active=True)
        male_count = students.filter(gender="M").count()
        female_count = students.filter(gender="F").count()

        # Teacher statistics
        teacher_assignments = ClassroomTeacherAssignment.objects.filter(
            classroom=classroom, is_active=True
        ).count()

        # Schedule statistics
        schedule_count = ClassSchedule.objects.filter(
            classroom=classroom, is_active=True
        ).count()

        return Response(
            {
                "enrollment": {
                    "total": classroom.current_enrollment,
                    "male": male_count,
                    "female": female_count,
                    "capacity": classroom.max_capacity,
                    "available_spots": classroom.available_spots,
                    "enrollment_percentage": (
                        round(
                            (classroom.current_enrollment / classroom.max_capacity)
                            * 100,
                            1,
                        )
                        if classroom.max_capacity > 0
                        else 0
                    ),
                },
                "teachers": {
                    "class_teacher": (
                        classroom.class_teacher.user.get_full_name()
                        if classroom.class_teacher
                        else None
                    ),
                    "subject_teachers": teacher_assignments,
                },
                "schedule": {"total_periods": schedule_count},
            }
        )


# Additional ViewSets for related models


class ClassroomTeacherAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ClassroomTeacherAssignment.objects.all().select_related(
        "classroom", "teacher__user", "subject"
    )
    serializer_class = ClassroomTeacherAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["classroom", "teacher", "subject", "is_active"]
    search_fields = [
        "classroom__name",
        "teacher__user__first_name",
        "teacher__user__last_name",
        "subject__name",
    ]
    ordering = ["classroom", "teacher__user__first_name"]


class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = StudentEnrollment.objects.all().select_related(
        "student", "classroom__section__grade_level"
    )
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["classroom", "student", "is_active"]
    search_fields = ["student__first_name", "student__last_name", "classroom__name"]
    ordering = ["-enrollment_date"]


class ClassScheduleViewSet(viewsets.ModelViewSet):
    queryset = ClassSchedule.objects.all().select_related(
        "classroom", "subject", "teacher__user"
    )
    serializer_class = ClassScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["classroom", "subject", "teacher", "day_of_week", "is_active"]
    search_fields = ["classroom__name", "subject__name", "teacher__user__first_name"]
    ordering = ["classroom", "day_of_week", "start_time"]

    @action(detail=False, methods=["get"])
    def by_classroom(self, request):
        """Get schedule grouped by classroom"""
        classroom_id = request.query_params.get("classroom")
        if not classroom_id:
            return Response(
                {"error": "classroom parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        schedules = (
            self.get_queryset()
            .filter(classroom_id=classroom_id, is_active=True)
            .order_by("day_of_week", "start_time")
        )

        # Group by day of week
        grouped_schedule = {}
        for schedule in schedules:
            day = schedule.get_day_of_week_display()
            if day not in grouped_schedule:
                grouped_schedule[day] = []
            grouped_schedule[day].append(ClassScheduleSerializer(schedule).data)

        return Response(grouped_schedule)
