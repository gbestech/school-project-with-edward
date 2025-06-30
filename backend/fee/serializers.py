# fees/serializers.py
from rest_framework import serializers
from .models import (
    AcademicSession,
    FeeStructure,
    StudentFee,
    Payment,
    FeeDiscount,
    StudentDiscount,
    PaymentReminder,
)
from students.models import Student


class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = "__all__"


class FeeStructureSerializer(serializers.ModelSerializer):
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    fee_type_display = serializers.CharField(
        source="get_fee_type_display", read_only=True
    )
    frequency_display = serializers.CharField(
        source="get_frequency_display", read_only=True
    )

    class Meta:
        model = FeeStructure
        fields = "__all__"


class StudentFeeListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_class = serializers.CharField(
        source="student.get_student_class_display", read_only=True
    )
    fee_type = serializers.CharField(
        source="fee_structure.get_fee_type_display", read_only=True
    )
    fee_name = serializers.CharField(source="fee_structure.name", read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_percentage = serializers.DecimalField(
        max_digits=5, decimal_places=2, read_only=True
    )
    is_overdue = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = StudentFee
        fields = [
            "id",
            "student_name",
            "student_class",
            "fee_type",
            "fee_name",
            "amount_due",
            "amount_paid",
            "balance",
            "discount_amount",
            "late_fee",
            "status",
            "status_display",
            "due_date",
            "payment_percentage",
            "is_overdue",
            "term",
            "remarks",
        ]


class StudentFeeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_class = serializers.CharField(
        source="student.get_student_class_display", read_only=True
    )
    fee_structure_details = FeeStructureSerializer(
        source="fee_structure", read_only=True
    )
    academic_session_name = serializers.CharField(
        source="academic_session.name", read_only=True
    )
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_percentage = serializers.DecimalField(
        max_digits=5, decimal_places=2, read_only=True
    )
    is_overdue = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    term_display = serializers.CharField(source="get_term_display", read_only=True)

    class Meta:
        model = StudentFee
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student_fee.student.full_name", read_only=True
    )
    fee_name = serializers.CharField(
        source="student_fee.fee_structure.name", read_only=True
    )
    payment_method_display = serializers.CharField(
        source="get_payment_method_display", read_only=True
    )

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = [
            "id",
            "reference",
            "verified",
            "verification_date",
            "receipt_number",
        ]


class PaymentInitiationSerializer(serializers.Serializer):
    student_fee_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    email = serializers.EmailField()
    callback_url = serializers.URLField(required=False)

    def validate_student_fee_id(self, value):
        try:
            student_fee = StudentFee.objects.get(id=value)
            return value
        except StudentFee.DoesNotExist:
            raise serializers.ValidationError("Student fee record not found.")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class PaymentVerificationSerializer(serializers.Serializer):
    reference = serializers.CharField(max_length=100)


class StudentDashboardSerializer(serializers.ModelSerializer):
    """Serializer for student fee dashboard"""

    student_name = serializers.CharField(source="user.full_name", read_only=True)
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )

    # Fee summary
    total_fees = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    total_balance = serializers.SerializerMethodField()
    overdue_count = serializers.SerializerMethodField()
    pending_count = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "student_name",
            "student_class_display",
            "education_level_display",
            "total_fees",
            "total_paid",
            "total_balance",
            "overdue_count",
            "pending_count",
        ]

    def get_total_fees(self, obj):
        current_session = AcademicSession.objects.filter(is_active=True).first()
        if current_session:
            return (
                obj.fees.filter(academic_session=current_session).aggregate(
                    total=serializers.models.Sum("amount_due")
                )["total"]
                or 0
            )
        return 0

    def get_total_paid(self, obj):
        current_session = AcademicSession.objects.filter(is_active=True).first()
        if current_session:
            return (
                obj.fees.filter(academic_session=current_session).aggregate(
                    total=serializers.models.Sum("amount_paid")
                )["total"]
                or 0
            )
        return 0

    def get_total_balance(self, obj):
        return self.get_total_fees(obj) - self.get_total_paid(obj)

    def get_overdue_count(self, obj):
        current_session = AcademicSession.objects.filter(is_active=True).first()
        if current_session:
            return obj.fees.filter(
                academic_session=current_session, status="OVERDUE"
            ).count()
        return 0

    def get_pending_count(self, obj):
        current_session = AcademicSession.objects.filter(is_active=True).first()
        if current_session:
            return obj.fees.filter(
                academic_session=current_session, status__in=["PENDING", "PARTIAL"]
            ).count()
        return 0


class FeeDiscountSerializer(serializers.ModelSerializer):
    discount_type_display = serializers.CharField(
        source="get_discount_type_display", read_only=True
    )

    class Meta:
        model = FeeDiscount
        fields = "__all__"


class StudentDiscountSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    discount_name = serializers.CharField(source="discount.name", read_only=True)
    discount_value = serializers.DecimalField(
        source="discount.value", max_digits=10, decimal_places=2, read_only=True
    )
    discount_type = serializers.CharField(
        source="discount.discount_type", read_only=True
    )
    applied_by_name = serializers.CharField(
        source="applied_by.full_name", read_only=True
    )

    class Meta:
        model = StudentDiscount
        fields = "__all__"


class PaymentReminderSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student_fee.student.full_name", read_only=True
    )
    fee_name = serializers.CharField(
        source="student_fee.fee_structure.name", read_only=True
    )
    amount_due = serializers.DecimalField(
        source="student_fee.amount_due", max_digits=10, decimal_places=2, read_only=True
    )
    due_date = serializers.DateField(source="student_fee.due_date", read_only=True)

    class Meta:
        model = PaymentReminder
        fields = "__all__"


class BulkFeeGenerationSerializer(serializers.Serializer):
    """Serializer for bulk fee generation"""

    academic_session_id = serializers.IntegerField()
    education_level = serializers.ChoiceField(
        choices=Student.EDUCATION_LEVEL_CHOICES, required=False
    )
    student_class = serializers.ChoiceField(
        choices=Student.CLASS_CHOICES, required=False
    )
    term = serializers.ChoiceField(choices=StudentFee.TERM_CHOICES, required=False)
    fee_structure_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of fee structure IDs to generate. If empty, all applicable fees will be generated.",
    )

    def validate_academic_session_id(self, value):
        try:
            AcademicSession.objects.get(id=value)
            return value
        except AcademicSession.DoesNotExist:
            raise serializers.ValidationError("Academic session not found.")


class FeeReportSerializer(serializers.Serializer):
    """Serializer for fee reports"""

    academic_session_id = serializers.IntegerField(required=False)
    education_level = serializers.ChoiceField(
        choices=Student.EDUCATION_LEVEL_CHOICES, required=False
    )
    student_class = serializers.ChoiceField(
        choices=Student.CLASS_CHOICES, required=False
    )
    fee_type = serializers.ChoiceField(
        choices=FeeStructure.FEE_TYPE_CHOICES, required=False
    )
    status = serializers.ChoiceField(
        choices=StudentFee.PAYMENT_STATUS_CHOICES, required=False
    )
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    report_type = serializers.ChoiceField(
        choices=[
            ("SUMMARY", "Summary Report"),
            ("DETAILED", "Detailed Report"),
            ("OVERDUE", "Overdue Report"),
            ("PAYMENT_HISTORY", "Payment History"),
        ]
    )
