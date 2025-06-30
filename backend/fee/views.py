# fees/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse
from django.template.loader import render_to_string
import csv
import io
from datetime import datetime


from .models import (
    AcademicSession,
    FeeStructure,
    StudentFee,
    Payment,
    FeeDiscount,
    StudentDiscount,
    PaymentReminder,
)
from .serializers import (
    AcademicSessionSerializer,
    FeeStructureSerializer,
    StudentFeeSerializer,
    StudentFeeListSerializer,
    PaymentSerializer,
    PaymentInitiationSerializer,
    PaymentVerificationSerializer,
    StudentDashboardSerializer,
    FeeDiscountSerializer,
    StudentDiscountSerializer,
    PaymentReminderSerializer,
    BulkFeeGenerationSerializer,
    FeeReportSerializer,
)
from .filters import StudentFeeFilter, PaymentFilter
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdmin
from .services import PaymentService, FeeService, ReportService
from students.models import Student


class AcademicSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing academic sessions"""

    queryset = AcademicSession.objects.all().order_by("-start_date")
    serializer_class = AcademicSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "start_date", "end_date"]
    ordering = ["-start_date"]

    @action(detail=True, methods=["post"])
    def set_active(self, request, pk=None):
        """Set an academic session as active"""
        session = self.get_object()

        # Deactivate all other sessions
        AcademicSession.objects.filter(is_active=True).update(is_active=False)

        # Activate this session
        session.is_active = True
        session.save()

        return Response(
            {
                "message": f'Academic session "{session.name}" is now active',
                "active_session": AcademicSessionSerializer(session).data,
            }
        )

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get the currently active academic session"""
        active_session = AcademicSession.objects.filter(is_active=True).first()
        if active_session:
            serializer = self.get_serializer(active_session)
            return Response(serializer.data)
        return Response({"message": "No active academic session found"}, status=404)


class FeeStructureViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fee structures"""

    queryset = FeeStructure.objects.all().order_by("name")
    serializer_class = FeeStructureSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "education_level",
        "student_class",
        "fee_type",
        "frequency",
        "is_active",
    ]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "amount", "created_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def by_class(self, request):
        """Get fee structures filtered by education level and class"""
        education_level = request.query_params.get("education_level")
        student_class = request.query_params.get("student_class")

        queryset = self.get_queryset().filter(is_active=True)

        if education_level:
            queryset = queryset.filter(education_level=education_level)
        if student_class:
            queryset = queryset.filter(student_class=student_class)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StudentFeeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing student fees"""

    queryset = (
        StudentFee.objects.select_related(
            "student", "fee_structure", "academic_session"
        )
        .all()
        .order_by("-created_at")
    )
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = StudentFeeFilter
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "fee_structure__name",
        "student__admission_number",
    ]
    ordering_fields = ["amount_due", "amount_paid", "due_date", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return StudentFeeListSerializer
        return StudentFeeSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # If user is a student, only show their own fees
        if hasattr(self.request.user, "student_profile"):
            queryset = queryset.filter(student=self.request.user.student_profile)

        return queryset

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        """Get student fee dashboard data"""
        if hasattr(request.user, "student_profile"):
            student = request.user.student_profile
            serializer = StudentDashboardSerializer(student)
            return Response(serializer.data)
        return Response({"error": "User is not a student"}, status=400)

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        """Get overdue fees"""
        queryset = self.get_queryset().filter(
            due_date__lt=timezone.now().date(), status__in=["PENDING", "PARTIAL"]
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def apply_discount(self, request, pk=None):
        """Apply discount to a student fee"""
        student_fee = self.get_object()
        discount_id = request.data.get("discount_id")

        try:
            discount = FeeDiscount.objects.get(id=discount_id, is_active=True)

            # Check if discount already applied
            if StudentDiscount.objects.filter(
                student=student_fee.student, discount=discount
            ).exists():
                return Response(
                    {"error": "Discount already applied to this student"}, status=400
                )

            # Apply discount
            student_discount = StudentDiscount.objects.create(
                student=student_fee.student, discount=discount, applied_by=request.user
            )

            # Recalculate fee amount
            FeeService.recalculate_student_fee(student_fee)

            return Response(
                {
                    "message": "Discount applied successfully",
                    "discount": StudentDiscountSerializer(student_discount).data,
                }
            )

        except FeeDiscount.DoesNotExist:
            return Response({"error": "Discount not found"}, status=404)

    @action(detail=False, methods=["post"])
    def bulk_generate(self, request):
        """Bulk generate fees for students"""
        serializer = BulkFeeGenerationSerializer(data=request.data)
        if serializer.is_valid():
            result = FeeService.bulk_generate_fees(serializer.validated_data)
            return Response(result)
        return Response(serializer.errors, status=400)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payments"""

    queryset = (
        Payment.objects.select_related(
            "student_fee__student", "student_fee__fee_structure"
        )
        .all()
        .order_by("-created_at")
    )
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PaymentFilter
    search_fields = [
        "reference",
        "student_fee__student__user__first_name",
        "student_fee__student__user__last_name",
    ]
    ordering_fields = ["amount", "payment_date", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()

        # If user is a student, only show their own payments
        if hasattr(self.request.user, "student_profile"):
            queryset = queryset.filter(
                student_fee__student=self.request.user.student_profile
            )

        return queryset

    @action(detail=False, methods=["post"])
    def initiate(self, request):
        """Initiate a payment"""
        serializer = PaymentInitiationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = PaymentService.initiate_payment(
                    serializer.validated_data, request.user
                )
                return Response(result)
            except Exception as e:
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["post"])
    def verify(self, request):
        """Verify a payment"""
        serializer = PaymentVerificationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = PaymentService.verify_payment(
                    serializer.validated_data["reference"]
                )
                return Response(result)
            except Exception as e:
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=["get"])
    def receipt(self, request, pk=None):
        """Generate payment receipt"""
        payment = self.get_object()

        # Generate PDF receipt (you'll need to implement this)
        # For now, return payment details
        return Response(
            {
                "payment": PaymentSerializer(payment).data,
                "receipt_url": f"/api/payments/{payment.id}/receipt/",
            }
        )


class FeeDiscountViewSet(viewsets.ModelViewSet):
    """ViewSet for managing fee discounts"""

    queryset = FeeDiscount.objects.all().order_by("name")
    serializer_class = FeeDiscountSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["discount_type", "is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "value", "created_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get active discounts"""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StudentDiscountViewSet(viewsets.ModelViewSet):
    """ViewSet for managing student discounts"""

    queryset = (
        StudentDiscount.objects.select_related("student", "discount", "applied_by")
        .all()
        .order_by("-applied_date")
    )
    serializer_class = StudentDiscountSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["student", "discount", "is_active"]
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "discount__name",
    ]
    ordering_fields = ["applied_date"]
    ordering = ["-applied_date"]

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """Deactivate a student discount"""
        student_discount = self.get_object()
        student_discount.is_active = False
        student_discount.save()

        # Recalculate affected fees
        student_fees = StudentFee.objects.filter(student=student_discount.student)
        for fee in student_fees:
            FeeService.recalculate_student_fee(fee)

        return Response({"message": "Discount deactivated successfully"})


class PaymentReminderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payment reminders"""

    queryset = (
        PaymentReminder.objects.select_related(
            "student_fee__student", "student_fee__fee_structure"
        )
        .all()
        .order_by("-created_at")
    )
    serializer_class = PaymentReminderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["sent", "reminder_type"]
    search_fields = [
        "student_fee__student__user__first_name",
        "student_fee__student__user__last_name",
    ]
    ordering_fields = ["created_at", "sent_date"]
    ordering = ["-created_at"]

    @action(detail=False, methods=["post"])
    def send_bulk(self, request):
        """Send bulk payment reminders"""
        reminder_type = request.data.get("reminder_type", "EMAIL")
        student_ids = request.data.get("student_ids", [])

        try:
            count = PaymentService.send_bulk_reminders(
                student_ids=student_ids, reminder_type=reminder_type
            )
            return Response({"message": f"{count} reminders sent successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @action(detail=True, methods=["post"])
    def mark_sent(self, request, pk=None):
        """Mark reminder as sent"""
        reminder = self.get_object()
        reminder.sent = True
        reminder.sent_date = timezone.now()
        reminder.save()

        return Response({"message": "Reminder marked as sent"})


class ReportViewSet(viewsets.ViewSet):
    """ViewSet for generating reports"""

    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Generate fee reports"""
        serializer = FeeReportSerializer(data=request.data)
        if serializer.is_valid():
            try:
                report_data = ReportService.generate_report(serializer.validated_data)
                return Response(report_data)
            except Exception as e:
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["post"])
    def export_csv(self, request):
        """Export report as CSV"""
        serializer = FeeReportSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Generate CSV content
                csv_content = ReportService.export_csv(serializer.validated_data)

                response = HttpResponse(csv_content, content_type="text/csv")
                response["Content-Disposition"] = (
                    'attachment; filename="fee_report.csv"'
                )
                return response

            except Exception as e:
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get fee summary statistics"""
        active_session = AcademicSession.objects.filter(is_active=True).first()

        if not active_session:
            return Response({"error": "No active academic session"}, status=400)

        # Calculate summary statistics
        total_fees = StudentFee.objects.filter(
            academic_session=active_session
        ).aggregate(
            total_due=Sum("amount_due"),
            total_paid=Sum("amount_paid"),
            total_balance=Sum("amount_due") - Sum("amount_paid"),
        )

        # Count statistics
        fee_counts = {
            "total_students": Student.objects.count(),
            "total_fees": StudentFee.objects.filter(
                academic_session=active_session
            ).count(),
            "paid_fees": StudentFee.objects.filter(
                academic_session=active_session, status="PAID"
            ).count(),
            "overdue_fees": StudentFee.objects.filter(
                academic_session=active_session, status="OVERDUE"
            ).count(),
            "pending_fees": StudentFee.objects.filter(
                academic_session=active_session, status__in=["PENDING", "PARTIAL"]
            ).count(),
        }

        return Response(
            {
                "session": AcademicSessionSerializer(active_session).data,
                "financial_summary": total_fees,
                "fee_counts": fee_counts,
            }
        )
