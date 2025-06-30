from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
import csv
from datetime import date, timedelta
from .models import Student
from .serializers import (
    StudentDetailSerializer,
    StudentListSerializer,
    StudentCreateSerializer,
)
from attendance.models import Attendance
from result.models import StudentResult


class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["education_level", "student_class", "gender"]
    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__email",
        "parent_contact",
    ]
    ordering_fields = ["user__first_name", "admission_date", "date_of_birth"]
    ordering = ["education_level", "student_class", "user__first_name"]

    def get_queryset(self):
        """Optimize queryset with select_related for better performance."""
        return Student.objects.select_related("user").prefetch_related("parents")

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return StudentListSerializer
        elif self.action == "create":
            return StudentCreateSerializer
        return StudentDetailSerializer

    def retrieve(self, request, pk=None):
        """Enhanced retrieve with education-level specific data."""
        student = get_object_or_404(Student, pk=pk)
        student_data = StudentDetailSerializer(student).data

        # Basic attendance summary
        attendance_qs = Attendance.objects.filter(student=student)
        total_attendance = attendance_qs.count()
        present_count = attendance_qs.filter(status="present").count()
        attendance_percentage = (
            round((present_count / total_attendance) * 100, 2)
            if total_attendance
            else 0
        )

        # Education level specific handling
        response_data = {
            "student": student_data,
            "attendance_summary": {
                "total_days": total_attendance,
                "present_days": present_count,
                "percentage": attendance_percentage,
            },
        }

        # For nursery students, focus on simpler metrics
        if student.education_level == "NURSERY":
            # Nursery-specific attendance (more recent focus)
            recent_attendance = attendance_qs.filter(
                date__gte=date.today() - timedelta(days=30)
            )
            recent_present = recent_attendance.filter(status="present").count()
            recent_total = recent_attendance.count()

            response_data["nursery_metrics"] = {
                "recent_attendance_percentage": (
                    round((recent_present / recent_total) * 100, 2)
                    if recent_total
                    else 0
                ),
                "age_group": self._get_age_group(student.age),
                "parent_contact_available": bool(student.parent_contact),
                "emergency_contact_available": bool(student.emergency_contact),
                "has_medical_conditions": bool(student.medical_conditions),
                "has_special_requirements": bool(student.special_requirements),
            }
        else:
            # For primary and secondary students, include detailed academic results
            results = StudentResult.objects.filter(student=student)
            term_breakdown = {}

            for term in ["term1", "term2", "term3"]:
                term_results = results.filter(term=term)
                avg_score = term_results.aggregate(avg=Avg("score"))["avg"] or 0
                term_breakdown[term] = {
                    "average_score": round(avg_score, 2),
                    "subjects": [
                        {"subject": r.subject.name, "score": r.score}
                        for r in term_results
                    ],
                }

            response_data["results_by_term"] = term_breakdown

        return Response(response_data)

    @action(detail=False, methods=["get"])
    def nursery_students(self, request):
        """Get all nursery students."""
        students = self.get_queryset().filter(education_level="NURSERY")
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def primary_students(self, request):
        """Get all primary students."""
        students = self.get_queryset().filter(education_level="PRIMARY")
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def secondary_students(self, request):
        """Get all secondary students."""
        students = self.get_queryset().filter(education_level="SECONDARY")
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def students_by_class(self, request):
        """Get students by specific class."""
        class_name = request.query_params.get("class_name")
        if not class_name:
            return Response(
                {"error": "class_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        students = self.get_queryset().filter(student_class=class_name)
        serializer = StudentListSerializer(students, many=True)
        return Response(
            {
                "class": class_name,
                "count": students.count(),
                "students": serializer.data,
            }
        )

    @action(detail=False, methods=["get"])
    def students_by_age_range(self, request):
        """Get students within a specific age range."""
        min_age = request.query_params.get("min_age")
        max_age = request.query_params.get("max_age")

        if not min_age or not max_age:
            return Response(
                {"error": "Both min_age and max_age parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            min_age, max_age = int(min_age), int(max_age)
        except ValueError:
            return Response(
                {"error": "Age parameters must be integers"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate date range for age filtering
        today = date.today()
        max_birth_date = today.replace(year=today.year - min_age)
        min_birth_date = today.replace(year=today.year - max_age - 1)

        students = self.get_queryset().filter(
            date_of_birth__gte=min_birth_date, date_of_birth__lte=max_birth_date
        )

        serializer = StudentListSerializer(students, many=True)
        return Response(
            {
                "age_range": f"{min_age}-{max_age} years",
                "count": students.count(),
                "students": serializer.data,
            }
        )

    @action(detail=False, methods=["get"])
    def student_statistics(self, request):
        """Get comprehensive student statistics."""
        queryset = self.get_queryset()

        stats = {
            "total_students": queryset.count(),
            "by_education_level": {
                "nursery": queryset.filter(education_level="NURSERY").count(),
                "primary": queryset.filter(education_level="PRIMARY").count(),
                "secondary": queryset.filter(education_level="SECONDARY").count(),
            },
            "by_gender": {
                "male": queryset.filter(gender="M").count(),
                "female": queryset.filter(gender="F").count(),
            },
            "age_distribution": self._get_age_distribution(queryset),
            "students_with_medical_conditions": queryset.exclude(
                Q(medical_conditions__isnull=True) | Q(medical_conditions__exact="")
            ).count(),
            "students_with_special_requirements": queryset.exclude(
                Q(special_requirements__isnull=True) | Q(special_requirements__exact="")
            ).count(),
        }

        return Response(stats)

    @action(detail=False, methods=["get"])
    def statistics_by_level(self, request):
        """Get detailed statistics broken down by education level."""
        queryset = self.get_queryset()

        stats_by_level = {}
        for level_code, level_name in [
            ("NURSERY", "Nursery"),
            ("PRIMARY", "Primary"),
            ("SECONDARY", "Secondary"),
        ]:
            level_students = queryset.filter(education_level=level_code)

            stats_by_level[level_code.lower()] = {
                "name": level_name,
                "total_count": level_students.count(),
                "gender_breakdown": {
                    "male": level_students.filter(gender="M").count(),
                    "female": level_students.filter(gender="F").count(),
                },
                "class_breakdown": dict(
                    level_students.values("student_class")
                    .annotate(count=Count("id"))
                    .values_list("student_class", "count")
                ),
                "average_age": self._calculate_average_age(level_students),
            }

            # Add level-specific metrics
            if level_code == "NURSERY":
                stats_by_level[level_code.lower()]["with_medical_conditions"] = (
                    level_students.exclude(
                        Q(medical_conditions__isnull=True)
                        | Q(medical_conditions__exact="")
                    ).count()
                )
                stats_by_level[level_code.lower()]["with_parent_contact"] = (
                    level_students.exclude(
                        Q(parent_contact__isnull=True) | Q(parent_contact__exact="")
                    ).count()
                )

        return Response(stats_by_level)

    @action(detail=False, methods=["get"])
    def students_with_medical_conditions(self, request):
        """Get students with medical conditions (important for nursery care)."""
        students = self.get_queryset().exclude(
            Q(medical_conditions__isnull=True) | Q(medical_conditions__exact="")
        )
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def students_with_special_requirements(self, request):
        """Get students with special requirements."""
        students = self.get_queryset().exclude(
            Q(special_requirements__isnull=True) | Q(special_requirements__exact="")
        )
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=True, methods=["get"])
    def emergency_contacts(self, request, pk=None):
        """Get emergency contact information for a student."""
        student = get_object_or_404(Student, pk=pk)

        contacts = []
        if student.parent_contact:
            contacts.append(
                {"type": "Parent", "number": student.parent_contact, "is_primary": True}
            )

        if (
            student.emergency_contact
            and student.emergency_contact != student.parent_contact
        ):
            contacts.append(
                {
                    "type": "Emergency",
                    "number": student.emergency_contact,
                    "is_primary": False,
                }
            )

        return Response(
            {"student_name": student.full_name, "emergency_contacts": contacts}
        )

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        """Export all students to CSV."""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="students_export.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "ID",
                "Full Name",
                "Email",
                "Gender",
                "Date of Birth",
                "Age",
                "Education Level",
                "Class",
                "Parent Contact",
                "Emergency Contact",
                "Admission Date",
            ]
        )

        for student in self.get_queryset():
            writer.writerow(
                [
                    student.id,
                    student.full_name,
                    student.user.email,
                    student.get_gender_display(),
                    student.date_of_birth,
                    student.age,
                    student.get_education_level_display(),
                    student.get_student_class_display(),
                    student.parent_contact or "",
                    student.emergency_contact or "",
                    student.admission_date,
                ]
            )

        return response

    @action(detail=False, methods=["get"])
    def export_nursery_csv(self, request):
        """Export nursery students with additional nursery-specific fields."""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="nursery_students_export.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(
            [
                "ID",
                "Full Name",
                "Age",
                "Gender",
                "Class",
                "Parent Contact",
                "Emergency Contact",
                "Medical Conditions",
                "Special Requirements",
                "Admission Date",
            ]
        )

        nursery_students = self.get_queryset().filter(education_level="NURSERY")
        for student in nursery_students:
            writer.writerow(
                [
                    student.id,
                    student.full_name,
                    student.age,
                    student.get_gender_display(),
                    student.get_student_class_display(),
                    student.parent_contact or "",
                    student.emergency_contact or "",
                    student.medical_conditions or "",
                    student.special_requirements or "",
                    student.admission_date,
                ]
            )

        return response

    def _get_age_group(self, age):
        """Categorize age into groups."""
        if age <= 3:
            return "Toddler"
        elif age <= 5:
            return "Pre-K"
        elif age <= 8:
            return "Early Elementary"
        elif age <= 12:
            return "Elementary"
        elif age <= 15:
            return "Middle School"
        else:
            return "High School"

    def _get_age_distribution(self, queryset):
        """Calculate age distribution across all students."""
        distribution = {"0-3": 0, "4-6": 0, "7-12": 0, "13-18": 0, "18+": 0}

        for student in queryset:
            age = student.age
            if age <= 3:
                distribution["0-3"] += 1
            elif age <= 6:
                distribution["4-6"] += 1
            elif age <= 12:
                distribution["7-12"] += 1
            elif age <= 18:
                distribution["13-18"] += 1
            else:
                distribution["18+"] += 1

        return distribution

    def _calculate_average_age(self, queryset):
        """Calculate average age for a queryset."""
        if not queryset.exists():
            return 0

        total_age = sum(student.age for student in queryset)
        return round(total_age / queryset.count(), 1)
