from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q, Count, Avg, Max, Min
from django.utils import timezone
from io import TextIOWrapper
import csv
from datetime import datetime, timedelta
import logging

# Import models
from .models import Exam, ExamSchedule, ExamRegistration, ExamStatistics
from result.models import StudentResult
from classroom.models import GradeLevel, Section
from subject.models import Subject
from teacher.models import Teacher
from students.models import Student
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import ExamForm, ExamScheduleForm


# Import serializers
from .serializers import (
    ExamListSerializer,
    ExamDetailSerializer,
    ExamCreateUpdateSerializer,
    ExamScheduleSerializer,
    ExamRegistrationSerializer,
    ResultSerializer,
    ResultCreateUpdateSerializer,
    ExamStatisticsSerializer,
)

# Import filters
from .filters import ExamFilter

logger = logging.getLogger(__name__)


def create_exam(request):
    if request.method == "POST":
        form = ExamForm(request.POST)
        if form.is_valid():
            exam = form.save()
            messages.success(request, f'Exam "{exam.title}" created successfully!')
            return redirect("exam_list")  # Adjust URL name as needed
    else:
        form = ExamForm()

    return render(request, "exams/exam_form.html", {"form": form})


def create_exam_schedule(request):
    if request.method == "POST":
        form = ExamScheduleForm(request.POST)
        if form.is_valid():
            schedule = form.save()
            messages.success(
                request, f'Exam schedule "{schedule.name}" created successfully!'
            )
            return redirect("exam_schedule_list")  # Adjust URL name as needed
    else:
        form = ExamScheduleForm()

    return render(request, "exams/exam_schedule_form.html", {"form": form})


class ExamViewSet(viewsets.ModelViewSet):
    """
    Streamlined ViewSet for managing exams
    """

    queryset = Exam.objects.select_related(
        "subject", "grade_level", "section", "teacher"
    ).prefetch_related("invigilators")

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ExamFilter
    search_fields = ["title", "description", "code", "subject__name", "venue"]
    ordering_fields = ["exam_date", "start_time", "title", "created_at"]
    ordering = ["-exam_date", "start_time"]
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for testing
    authentication_classes = []  # Disable authentication for testing

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == "list":
            return ExamListSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return ExamCreateUpdateSerializer
        return ExamDetailSerializer

    def get_queryset(self):
        """Optimize queryset for list view"""
        queryset = super().get_queryset()
        if self.action == "list":
            queryset = queryset.annotate(
                registered_students_count=Count("examregistration", distinct=True)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Bulk create results"""
        results_data = request.data.get("results", [])
        
        if not results_data:
            return Response(
                {"error": "Results data is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        created_results = []
        errors = []
        
        with transaction.atomic():
            for i, result_data in enumerate(results_data):
                serializer = ResultCreateUpdateSerializer(data=result_data)
                if serializer.is_valid():
                    result = serializer.save(recorded_by=request.user)
                    created_results.append(result.id)
                else:
                    errors.append({"index": i, "errors": serializer.errors})
            
            if errors:
                transaction.set_rollback(True)
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "message": f"Created {len(created_results)} results",
            "created_ids": created_results
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        """Bulk update results"""
        results_data = request.data.get("results", [])
        
        if not results_data:
            return Response(
                {"error": "Results data is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = 0
        errors = []
        
        with transaction.atomic():
            for i, result_data in enumerate(results_data):
                result_id = result_data.get("id")
                if not result_id:
                    errors.append({"index": i, "error": "Result ID is required"})
                    continue
                
                try:
                    result = StudentResult.objects.get(id=result_id)
                    serializer = ResultCreateUpdateSerializer(result, data=result_data, partial=True)
                    if serializer.is_valid():
                        serializer.save(updated_by=request.user)
                        updated_count += 1
                    else:
                        errors.append({"index": i, "errors": serializer.errors})
                except StudentResult.DoesNotExist:
                    errors.append({"index": i, "error": f"Result {result_id} not found"})
                except Exception as e:
                    errors.append({"index": i, "error": str(e)})
            
            if errors:
                transaction.set_rollback(True)
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "message": f"Updated {updated_count} results",
            "updated_count": updated_count
        })

    @action(detail=False, methods=["get"])
    def by_student(self, request, student_id=None):
        """Get results by student"""
        if not student_id:
            return Response(
                {"error": "Student ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_exam(self, request, exam_id=None):
        """Get results by exam"""
        if not exam_id:
            return Response(
                {"error": "Exam ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = self.get_queryset().filter(exam_id=exam_id)
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_subject(self, request, subject_id=None):
        """Get results by subject"""
        if not subject_id:
            return Response(
                {"error": "Subject ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = self.get_queryset().filter(subject_id=subject_id)
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_grade(self, request, grade_id=None):
        """Get results by grade level"""
        if not grade_id:
            return Response(
                {"error": "Grade ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = self.get_queryset().filter(grade_level_id=grade_id)
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def student_transcript(self, request, student_id=None):
        """Get student transcript"""
        if not student_id:
            return Response(
                {"error": "Student ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = self.get_queryset().filter(student_id=student_id).order_by('exam__exam_date')
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def grade_sheet(self, request, exam_id=None):
        """Get grade sheet for an exam"""
        if not exam_id:
            return Response(
                {"error": "Exam ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        results = self.get_queryset().filter(exam_id=exam_id).order_by('student__user__first_name')
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    # Core Exam Management
    @action(detail=True, methods=["post"])
    def start_exam(self, request, pk=None):
        """Start an exam"""
        exam = self.get_object()

        if exam.status != "scheduled":
            return Response(
                {"error": "Only scheduled exams can be started"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exam.status = "in_progress"
        exam.save()
        return Response({"message": "Exam started successfully"})

    @action(detail=True, methods=["post"])
    def end_exam(self, request, pk=None):
        """End an exam and generate statistics"""
        exam = self.get_object()

        if exam.status != "in_progress":
            return Response(
                {"error": "Only exams in progress can be ended"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exam.status = "completed"
        exam.save()

        # Generate statistics
        self._generate_exam_statistics(exam)
        return Response({"message": "Exam ended successfully"})

    @action(detail=True, methods=["post"])
    def cancel_exam(self, request, pk=None):
        """Cancel an exam"""
        exam = self.get_object()

        if exam.status == "completed":
            return Response(
                {"error": "Cannot cancel completed exam"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exam.status = "cancelled"
        exam.cancellation_reason = request.data.get("reason", "")
        exam.save()
        return Response({"message": "Exam cancelled successfully"})

    @action(detail=True, methods=["post"])
    def postpone_exam(self, request, pk=None):
        """Postpone an exam"""
        exam = self.get_object()
        new_date = request.data.get("new_date")
        new_start_time = request.data.get("new_start_time")
        new_end_time = request.data.get("new_end_time")
        reason = request.data.get("reason", "")

        if not new_date:
            return Response(
                {"error": "New date is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if exam.status == "completed":
            return Response(
                {"error": "Cannot postpone completed exam"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        exam.exam_date = new_date
        if new_start_time:
            exam.start_time = new_start_time
        if new_end_time:
            exam.end_time = new_end_time
        
        exam.postponement_reason = reason
        exam.save()
        
        return Response({"message": "Exam postponed successfully"})

    # Approval Workflow
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve an exam"""
        exam = self.get_object()
        
        if exam.status != "pending_approval":
            return Response(
                {"error": "Only exams pending approval can be approved"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get approver - try to get Teacher from User, or use None if not available
        approver = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                from teacher.models import Teacher
                approver = Teacher.objects.get(user=request.user)
            except Teacher.DoesNotExist:
                # If user is not a teacher, we'll leave approver as None
                pass
        
        notes = request.data.get("notes", "")
        
        exam.approve(approver, notes)
        
        return Response({
            "message": "Exam approved successfully",
            "status": exam.status,
            "approved_at": exam.approved_at,
            "approved_by": exam.approved_by.id if exam.approved_by else None
        })

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reject an exam"""
        exam = self.get_object()
        
        if exam.status != "pending_approval":
            return Response(
                {"error": "Only exams pending approval can be rejected"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get approver - try to get Teacher from User, or use None if not available
        approver = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                from teacher.models import Teacher
                approver = Teacher.objects.get(user=request.user)
            except Teacher.DoesNotExist:
                # If user is not a teacher, we'll leave approver as None
                pass
        
        reason = request.data.get("reason", "")
        
        exam.reject(approver, reason)
        
        return Response({
            "message": "Exam rejected successfully",
            "status": exam.status,
            "rejected_at": exam.approved_at,
            "rejected_by": exam.approved_by.id if exam.approved_by else None,
            "rejection_reason": exam.rejection_reason
        })

    @action(detail=True, methods=["post"])
    def submit_for_approval(self, request, pk=None):
        """Submit exam for approval"""
        exam = self.get_object()
        
        if exam.status not in ["draft", "rejected"]:
            return Response(
                {"error": "Only draft or rejected exams can be submitted for approval"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exam.submit_for_approval()
        
        return Response({
            "message": "Exam submitted for approval successfully",
            "status": exam.status
        })

    # Student Registration
    @action(detail=True, methods=["post"])
    def register_student(self, request, pk=None):
        """Register a student for an exam"""
        exam = self.get_object()
        student_id = request.data.get("student_id")

        if not student_id:
            return Response(
                {"error": "Student ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if already registered
        if ExamRegistration.objects.filter(exam=exam, student=student).exists():
            return Response(
                {"error": "Student already registered for this exam"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration = ExamRegistration.objects.create(
            exam=exam, student=student, registration_date=timezone.now()
        )

        serializer = ExamRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"])
    def unregister_student(self, request, pk=None):
        """Unregister a student from an exam"""
        exam = self.get_object()
        student_id = request.data.get("student_id")

        try:
            registration = ExamRegistration.objects.get(
                exam=exam, student_id=student_id
            )
            registration.delete()
            return Response({"message": "Student unregistered successfully"})
        except ExamRegistration.DoesNotExist:
            return Response(
                {"error": "Registration not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["get"])
    def registrations(self, request, pk=None):
        """Get all registrations for an exam"""
        exam = self.get_object()
        registrations = ExamRegistration.objects.filter(exam=exam).select_related(
            "student"
        )
        serializer = ExamRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def get_registrations(self, request, pk=None):
        """Get all registrations for an exam (alias for registrations)"""
        return self.registrations(request, pk)

    @action(detail=True, methods=["get"])
    def get_results(self, request, pk=None):
        """Get results for an exam (alias for results)"""
        return self.results(request, pk)

    @action(detail=True, methods=["get"])
    def get_statistics(self, request, pk=None):
        """Get statistics for an exam (alias for statistics)"""
        return self.statistics(request, pk)

    # Results Management
    @action(detail=True, methods=["get"])
    def results(self, request, pk=None):
        """Get results for an exam"""
        exam = self.get_object()
        results = StudentResult.objects.filter(exam=exam).select_related("student")
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def bulk_create_results(self, request, pk=None):
        """Bulk create results for an exam"""
        exam = self.get_object()
        results_data = request.data.get("results", [])

        if not results_data:
            return Response(
                {"error": "Results data is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_results = []
        errors = []

        with transaction.atomic():
            for i, result_data in enumerate(results_data):
                result_data["exam"] = exam.id
                result_data["subject"] = exam.subject.id

                serializer = ResultCreateUpdateSerializer(data=result_data)
                if serializer.is_valid():
                    result = serializer.save(recorded_by=request.user)
                    created_results.append(result.id)
                else:
                    errors.append({"index": i, "errors": serializer.errors})

            if errors:
                transaction.set_rollback(True)
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": f"Created {len(created_results)} results",
                "created_ids": created_results,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"])
    def statistics(self, request, pk=None):
        """Get statistics for an exam"""
        exam = self.get_object()
        stats, created = ExamStatistics.objects.get_or_create(
            exam=exam, defaults={"calculated_at": timezone.now()}
        )

        # Recalculate if stats are older than 1 hour
        if not created and stats.calculated_at < timezone.now() - timedelta(hours=1):
            self._generate_exam_statistics(exam)
            stats.refresh_from_db()

        serializer = ExamStatisticsSerializer(stats)
        return Response(serializer.data)

    # Essential Filters
    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        """Get upcoming exams"""
        today = timezone.now().date()
        exams = (
            self.get_queryset()
            .filter(exam_date__gte=today, status="scheduled")
            .order_by("exam_date", "start_time")
        )

        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_schedule(self, request):
        """Get exams by schedule"""
        schedule_id = request.GET.get("schedule_id")
        if not schedule_id:
            return Response(
                {"error": "Schedule ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exams = self.get_queryset().filter(exam_schedule_id=schedule_id)
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_teacher(self, request, teacher_id=None):
        """Get exams created by a specific teacher"""
        if not teacher_id:
            return Response(
                {"error": "Teacher ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exams = self.get_queryset().filter(teacher_id=teacher_id)
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_subject(self, request, subject_id=None):
        """Get exams by subject"""
        if not subject_id:
            return Response(
                {"error": "Subject ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exams = self.get_queryset().filter(subject_id=subject_id)
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_grade(self, request, grade_id=None):
        """Get exams by grade level"""
        if not grade_id:
            return Response(
                {"error": "Grade ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        exams = self.get_queryset().filter(grade_level_id=grade_id)
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def completed(self, request):
        """Get completed exams"""
        exams = self.get_queryset().filter(status="completed")
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def ongoing(self, request):
        """Get ongoing exams"""
        exams = self.get_queryset().filter(status="in_progress")
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def calendar_view(self, request):
        """Get exams in calendar format"""
        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")
        
        queryset = self.get_queryset()
        
        if start_date:
            queryset = queryset.filter(exam_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(exam_date__lte=end_date)
            
        exams = queryset.order_by("exam_date", "start_time")
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary_list(self, request):
        """Get exam summary list"""
        exams = self.get_queryset().annotate(
            registered_students_count=Count("examregistration", distinct=True)
        )
        serializer = self.get_serializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        """Bulk update exams"""
        exam_ids = request.data.get("exam_ids", [])
        update_data = request.data.get("update_data", {})
        
        if not exam_ids:
            return Response(
                {"error": "Exam IDs are required"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = 0
        errors = []
        
        with transaction.atomic():
            for exam_id in exam_ids:
                try:
                    exam = Exam.objects.get(id=exam_id)
                    for field, value in update_data.items():
                        if hasattr(exam, field):
                            setattr(exam, field, value)
                    exam.save()
                    updated_count += 1
                except Exam.DoesNotExist:
                    errors.append(f"Exam {exam_id} not found")
                except Exception as e:
                    errors.append(f"Exam {exam_id}: {str(e)}")
        
        return Response({
            "message": f"Updated {updated_count} exams",
            "updated_count": updated_count,
            "errors": errors
        })

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        """Bulk delete exams"""
        exam_ids = request.data.get("exam_ids", [])
        
        if not exam_ids:
            return Response(
                {"error": "Exam IDs are required"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count = 0
        errors = []
        
        with transaction.atomic():
            for exam_id in exam_ids:
                try:
                    exam = Exam.objects.get(id=exam_id)
                    exam.delete()
                    deleted_count += 1
                except Exam.DoesNotExist:
                    errors.append(f"Exam {exam_id} not found")
                except Exception as e:
                    errors.append(f"Exam {exam_id}: {str(e)}")
        
        return Response({
            "message": f"Deleted {deleted_count} exams",
            "deleted_count": deleted_count,
            "errors": errors
        })

    # Import/Export
    @action(detail=False, methods=["post"])
    def import_csv(self, request):
        """Import exams from CSV"""
        file = request.FILES.get("file")
        if not file or not file.name.endswith(".csv"):
            return Response(
                {"error": "Valid CSV file is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            decoded_file = TextIOWrapper(file.file, encoding="utf-8")
            reader = csv.DictReader(decoded_file)

            required_headers = [
                "title",
                "subject",
                "grade_level",
                "exam_date",
                "start_time",
                "end_time",
            ]
            missing_headers = [
                h for h in required_headers if h not in reader.fieldnames
            ]

            if missing_headers:
                return Response(
                    {
                        "error": f'Missing required columns: {", ".join(missing_headers)}'
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            created_exams = []
            errors = []

            with transaction.atomic():
                for row_num, row in enumerate(reader, start=2):
                    try:
                        exam_data = self._process_csv_row(row, row_num)
                        if "error" in exam_data:
                            errors.append(exam_data["error"])
                            continue

                        serializer = ExamCreateUpdateSerializer(data=exam_data)
                        if serializer.is_valid():
                            exam = serializer.save(created_by=request.user)
                            created_exams.append(exam.id)
                        else:
                            errors.append(f"Row {row_num}: {serializer.errors}")

                    except Exception as e:
                        errors.append(f"Row {row_num}: {str(e)}")

                if errors:
                    transaction.set_rollback(True)
                    return Response(
                        {"error": "CSV import failed", "details": errors},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            return Response(
                {
                    "message": f"Successfully imported {len(created_exams)} exams",
                    "created_exam_ids": created_exams,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"CSV import error: {str(e)}")
            return Response(
                {"error": f"Import failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        """Export exams to CSV"""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="exams.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "id",
                "title",
                "code",
                "subject_name",
                "grade_level_name",
                "section_name",
                "teacher_name",
                "exam_date",
                "start_time",
                "end_time",
                "duration_minutes",
                "total_marks",
                "pass_marks",
                "venue",
                "status",
                "exam_type",
            ]
        )

        for exam in self.filter_queryset(self.get_queryset()).select_related(
            "subject", "grade_level", "section", "teacher"
        ):
            writer.writerow(
                [
                    exam.id,
                    exam.title,
                    exam.code,
                    exam.subject.name,
                    exam.grade_level.name,
                    exam.section.name if exam.section else "",
                    exam.teacher.full_name if exam.teacher else "",
                    exam.exam_date.strftime("%Y-%m-%d"),
                    exam.start_time.strftime("%H:%M"),
                    exam.end_time.strftime("%H:%M"),
                    exam.duration_minutes,
                    exam.total_marks,
                    exam.pass_marks,
                    exam.venue,
                    exam.status,
                    exam.exam_type,
                ]
            )

        return response

    # Helper Methods
    def _process_csv_row(self, row, row_num):
        """Process a single CSV row"""
        try:
            # Get related objects
            subject = Subject.objects.get(name=row["subject"].strip())
            grade_level = GradeLevel.objects.get(name=row["grade_level"].strip())

            section = None
            if row.get("section") and row["section"].strip():
                section = Section.objects.get(name=row["section"].strip())

            teacher = None
            if row.get("teacher") and row["teacher"].strip():
                teacher = Teacher.objects.get(full_name=row["teacher"].strip())

            # Parse dates
            exam_date = datetime.strptime(row["exam_date"], "%Y-%m-%d").date()
            start_time = datetime.strptime(row["start_time"], "%H:%M").time()
            end_time = datetime.strptime(row["end_time"], "%H:%M").time()

            return {
                "title": row["title"].strip(),
                "subject": subject.id,
                "grade_level": grade_level.id,
                "section": section.id if section else None,
                "teacher": teacher.id if teacher else None,
                "exam_date": exam_date,
                "start_time": start_time,
                "end_time": end_time,
                "description": row.get("description", "").strip(),
                "total_marks": int(row.get("total_marks", 100)),
                "pass_marks": int(row.get("pass_marks", 40)),
                "venue": row.get("venue", "").strip(),
                "exam_type": row.get("exam_type", "written"),
                "status": row.get("status", "scheduled"),
            }
        except Exception as e:
            return {"error": f"Row {row_num}: {str(e)}"}

    def _generate_exam_statistics(self, exam):
        """Generate statistics for an exam"""
        results = StudentResult.objects.filter(exam=exam)

        if not results.exists():
            return

        total_registered = ExamRegistration.objects.filter(exam=exam).count()
        total_appeared = results.count()

        stats_data = {
            "total_registered": total_registered,
            "total_appeared": total_appeared,
            "total_absent": total_registered - total_appeared,
            "highest_score": results.aggregate(Max("score"))["score__max"] or 0,
            "lowest_score": results.aggregate(Min("score"))["score__min"] or 0,
            "average_score": results.aggregate(Avg("score"))["score__avg"] or 0,
            "total_passed": results.filter(is_pass=True).count(),
            "total_failed": results.filter(is_pass=False).count(),
        }

        stats_data["pass_percentage"] = (
            (stats_data["total_passed"] / stats_data["total_appeared"] * 100)
            if stats_data["total_appeared"] > 0
            else 0
        )

        ExamStatistics.objects.update_or_create(
            exam=exam, defaults={**stats_data, "calculated_at": timezone.now()}
        )


class ExamScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for exam schedules"""

    queryset = ExamSchedule.objects.all()
    serializer_class = ExamScheduleSerializer
    ordering = ["-created_at"]
    permission_classes = []  # Temporarily allow unauthenticated access for testing

    @action(detail=True, methods=["get"])
    def exams(self, request, pk=None):
        """Get exams for a schedule"""
        schedule = self.get_object()
        exams = Exam.objects.filter(exam_schedule=schedule)
        from .serializers import ExamListSerializer

        serializer = ExamListSerializer(exams, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def get_exams(self, request, pk=None):
        """Get exams for a schedule (alias for exams)"""
        return self.exams(request, pk)

    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        """Toggle schedule active status"""
        schedule = self.get_object()
        schedule.is_active = not schedule.is_active
        schedule.save()

        status_text = "activated" if schedule.is_active else "deactivated"
        return Response({"message": f"Schedule {status_text}"})


class ExamRegistrationViewSet(viewsets.ModelViewSet):
    """ViewSet for exam registrations"""

    queryset = ExamRegistration.objects.select_related("exam", "student")
    serializer_class = ExamRegistrationSerializer
    ordering = ["-registration_date"]
    permission_classes = []  # Temporarily allow unauthenticated access for testing

    def get_queryset(self):
        """Filter by student or exam if provided"""
        queryset = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        exam_id = self.request.query_params.get("exam_id")

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)

        return queryset

    @action(detail=False, methods=["post"])
    def bulk_register(self, request):
        """Bulk register students for an exam"""
        exam_id = request.data.get("exam_id")
        student_ids = request.data.get("student_ids", [])

        if not exam_id or not student_ids:
            return Response(
                {"error": "Exam ID and student IDs are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return Response(
                {"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND
            )

        created_registrations = []
        errors = []

        with transaction.atomic():
            for student_id in student_ids:
                try:
                    student = Student.objects.get(id=student_id)

                    # Check if already registered
                    if ExamRegistration.objects.filter(
                        exam=exam, student=student
                    ).exists():
                        errors.append(f"Student {student_id} already registered")
                        continue

                    registration = ExamRegistration.objects.create(
                        exam=exam, student=student, registration_date=timezone.now()
                    )
                    created_registrations.append(registration.id)

                except Student.DoesNotExist:
                    errors.append(f"Student {student_id} not found")
                except Exception as e:
                    errors.append(f"Student {student_id}: {str(e)}")

        return Response(
            {
                "message": f"Registered {len(created_registrations)} students",
                "created_registrations": created_registrations,
                "errors": errors,
            }
        )

    @action(detail=False, methods=["get"])
    def by_student(self, request, student_id=None):
        """Get registrations by student"""
        if not student_id:
            return Response(
                {"error": "Student ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        registrations = self.get_queryset().filter(student_id=student_id)
        serializer = self.get_serializer(registrations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_exam(self, request, exam_id=None):
        """Get registrations by exam"""
        if not exam_id:
            return Response(
                {"error": "Exam ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        registrations = self.get_queryset().filter(exam_id=exam_id)
        serializer = self.get_serializer(registrations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def mark_attendance(self, request):
        """Mark attendance for exam registrations"""
        attendance_data = request.data.get("attendance", [])
        
        if not attendance_data:
            return Response(
                {"error": "Attendance data is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = 0
        errors = []
        
        with transaction.atomic():
            for item in attendance_data:
                registration_id = item.get("registration_id")
                is_present = item.get("is_present", False)
                
                if not registration_id:
                    errors.append("Registration ID is required")
                    continue
                
                try:
                    registration = ExamRegistration.objects.get(id=registration_id)
                    registration.is_present = is_present
                    registration.save()
                    updated_count += 1
                except ExamRegistration.DoesNotExist:
                    errors.append(f"Registration {registration_id} not found")
                except Exception as e:
                    errors.append(f"Registration {registration_id}: {str(e)}")
        
        return Response({
            "message": f"Updated attendance for {updated_count} registrations",
            "updated_count": updated_count,
            "errors": errors
        })


class ResultViewSet(viewsets.ModelViewSet):
    """ViewSet for exam results"""

    queryset = StudentResult.objects.select_related("exam", "student", "subject")
    serializer_class = ResultSerializer
    ordering = ["-created_at"]
    permission_classes = []  # Temporarily allow unauthenticated access for testing

    def get_queryset(self):
        """Filter by exam, student, or subject if provided"""
        queryset = super().get_queryset()
        exam_id = self.request.query_params.get("exam_id")
        student_id = self.request.query_params.get("student_id")
        subject_id = self.request.query_params.get("subject_id")

        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ResultCreateUpdateSerializer
        return ResultSerializer

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(recorded_by=self.request.user)


# Add this ExamStatisticsViewSet class to your views.py file


class ExamStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for exam statistics (read-only)"""

    queryset = ExamStatistics.objects.select_related("exam")
    serializer_class = ExamStatisticsSerializer
    ordering = ["-calculated_at"]
    permission_classes = []  # Temporarily allow unauthenticated access for testing

    def get_queryset(self):
        """Filter by exam if provided"""
        queryset = super().get_queryset()
        exam_id = self.request.query_params.get("exam_id")

        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)

        return queryset

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get statistics summary across all exams"""
        stats = self.get_queryset()

        if not stats.exists():
            return Response({"message": "No statistics available", "total_exams": 0})

        summary_data = {
            "total_exams": stats.count(),
            "total_students_registered": sum(s.total_registered for s in stats),
            "total_students_appeared": sum(s.total_appeared for s in stats),
            "average_pass_rate": stats.aggregate(avg_pass=Avg("pass_percentage"))[
                "avg_pass"
            ]
            or 0,
            "highest_average_score": stats.aggregate(max_avg=Max("average_score"))[
                "max_avg"
            ]
            or 0,
        }

        return Response(summary_data)

    @action(detail=True, methods=["post"])
    def recalculate(self, request, pk=None):
        """Recalculate statistics for a specific exam"""
        stats = self.get_object()
        exam = stats.exam

        # Use the helper method from ExamViewSet
        exam_viewset = ExamViewSet()
        exam_viewset._generate_exam_statistics(exam)

        # Refresh the statistics object
        stats.refresh_from_db()
        serializer = self.get_serializer(stats)

        return Response(
            {
                "message": "Statistics recalculated successfully",
                "statistics": serializer.data,
            }
        )
