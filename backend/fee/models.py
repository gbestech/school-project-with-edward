# fees/models.py
from django.db import models
from django.contrib.auth import get_user_model
from students.models import Student, EDUCATION_LEVEL_CHOICES, CLASS_CHOICES
from decimal import Decimal
import uuid
from datetime import date, datetime

User = get_user_model()

FEE_TYPE_CHOICES = (
    ("TUITION", "Tuition Fee"),
    ("LIBRARY", "Library Fee"),
    ("LABORATORY", "Laboratory Fee"),
    ("SPORTS", "Sports Fee"),
    ("EXAM", "Examination Fee"),
    ("DEVELOPMENT", "Development Fee"),
    ("TRANSPORT", "Transport Fee"),
    ("HOSTEL", "Hostel Fee"),
    ("UNIFORM", "Uniform Fee"),
    ("BOOKS", "Books Fee"),
    ("COMPUTER", "Computer Fee"),
    ("MEDICAL", "Medical Fee"),
    ("REGISTRATION", "Registration Fee"),
    ("GRADUATION", "Graduation Fee"),
    ("MISCELLANEOUS", "Miscellaneous Fee"),
)

FEE_FREQUENCY_CHOICES = (
    ("ANNUAL", "Annual"),
    ("TERMLY", "Termly"),
    ("MONTHLY", "Monthly"),
    ("ONE_TIME", "One Time"),
)

PAYMENT_STATUS_CHOICES = (
    ("PENDING", "Pending"),
    ("PARTIAL", "Partial"),
    ("PAID", "Paid"),
    ("OVERDUE", "Overdue"),
    ("CANCELLED", "Cancelled"),
)

PAYMENT_METHOD_CHOICES = (
    ("PAYSTACK", "Paystack"),
    ("BANK_TRANSFER", "Bank Transfer"),
    ("CASH", "Cash"),
    ("CHEQUE", "Cheque"),
)

TERM_CHOICES = (
    ("FIRST", "First Term"),
    ("SECOND", "Second Term"),
    ("THIRD", "Third Term"),
)


class AcademicSession(models.Model):
    """Academic Session/Year model"""

    name = models.CharField(max_length=20, unique=True, help_text="e.g., 2024/2025")
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "Academic Session"
        verbose_name_plural = "Academic Sessions"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.is_active:
            # Ensure only one active session at a time
            AcademicSession.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)


class FeeStructure(models.Model):
    """Fee structure for different classes and fee types"""

    name = models.CharField(max_length=100)
    fee_type = models.CharField(max_length=20, choices=FEE_TYPE_CHOICES)
    education_level = models.CharField(max_length=10, choices=EDUCATION_LEVEL_CHOICES)
    student_class = models.CharField(
        max_length=20, choices=CLASS_CHOICES, blank=True, null=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(max_length=10, choices=FEE_FREQUENCY_CHOICES)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    is_mandatory = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    due_date_offset = models.IntegerField(
        default=30, help_text="Days from term start for due date"
    )
    late_fee_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.00
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            "fee_type",
            "education_level",
            "student_class",
            "academic_session",
        )
        ordering = ["education_level", "student_class", "fee_type"]
        verbose_name = "Fee Structure"
        verbose_name_plural = "Fee Structures"

    def __str__(self):
        class_display = (
            f" - {self.get_student_class_display()}" if self.student_class else ""
        )
        return f"{self.name} ({self.get_education_level_display()}{class_display}) - ₦{self.amount}"


class StudentFee(models.Model):
    """Individual student fee records"""

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="fees")
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    term = models.CharField(max_length=10, choices=TERM_CHOICES, blank=True, null=True)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=10, choices=PAYMENT_STATUS_CHOICES, default="PENDING"
    )
    due_date = models.DateField()
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "fee_structure", "academic_session", "term")
        ordering = ["due_date", "student__user__first_name"]
        verbose_name = "Student Fee"
        verbose_name_plural = "Student Fees"

    def __str__(self):
        return (
            f"{self.student.full_name} - {self.fee_structure.name} - ₦{self.amount_due}"
        )

    @property
    def balance(self):
        """Calculate remaining balance"""
        return self.amount_due - self.amount_paid

    @property
    def is_overdue(self):
        """Check if fee is overdue"""
        return date.today() > self.due_date and self.status != "PAID"

    @property
    def payment_percentage(self):
        """Calculate payment percentage"""
        if self.amount_due > 0:
            return (self.amount_paid / self.amount_due) * 100
        return 0

    def update_status(self):
        """Update payment status based on amount paid"""
        if self.amount_paid >= self.amount_due:
            self.status = "PAID"
        elif self.amount_paid > 0:
            self.status = "PARTIAL"
        elif self.is_overdue:
            self.status = "OVERDUE"
        else:
            self.status = "PENDING"
        self.save()


class Payment(models.Model):
    """Payment records"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_fee = models.ForeignKey(
        StudentFee, on_delete=models.CASCADE, related_name="payments"
    )
    reference = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_date = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(blank=True, null=True)

    # Paystack specific fields
    paystack_reference = models.CharField(max_length=100, blank=True, null=True)
    paystack_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    paystack_status = models.CharField(max_length=20, blank=True, null=True)

    # Additional payment details
    payer_email = models.EmailField(blank=True, null=True)
    payer_name = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    receipt_number = models.CharField(max_length=20, unique=True, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-payment_date"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"Payment {self.reference} - ₦{self.amount}"

    def generate_receipt_number(self):
        """Generate unique receipt number"""
        if not self.receipt_number:
            year = datetime.now().year
            count = Payment.objects.filter(payment_date__year=year).count() + 1
            self.receipt_number = f"RCT{year}{count:06d}"
            self.save()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.verified and not self.receipt_number:
            self.generate_receipt_number()

        # Update student fee payment status
        if self.verified:
            self.student_fee.amount_paid = (
                self.student_fee.payments.filter(verified=True).aggregate(
                    total=models.Sum("amount")
                )["total"]
                or 0
            )
            self.student_fee.update_status()


class FeeDiscount(models.Model):
    """Fee discount/scholarship model"""

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(
        max_length=10, choices=[("PERCENTAGE", "Percentage"), ("FIXED", "Fixed Amount")]
    )
    value = models.DecimalField(max_digits=10, decimal_places=2)
    applicable_fee_types = models.ManyToManyField("FeeStructure", blank=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateField()
    valid_to = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.value}{'%' if self.discount_type == 'PERCENTAGE' else '₦'}"


class StudentDiscount(models.Model):
    """Student-specific discount assignments"""

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="discounts"
    )
    discount = models.ForeignKey(FeeDiscount, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    applied_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    applied_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("student", "discount", "academic_session")

    def __str__(self):
        return f"{self.student.full_name} - {self.discount.name}"


class PaymentReminder(models.Model):
    """Payment reminder system"""

    student_fee = models.ForeignKey(
        StudentFee, on_delete=models.CASCADE, related_name="reminders"
    )
    reminder_type = models.CharField(
        max_length=10,
        choices=[("EMAIL", "Email"), ("SMS", "SMS"), ("BOTH", "Email & SMS")],
    )
    sent_date = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    is_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"Reminder for {self.student_fee.student.full_name} - {self.student_fee.fee_structure.name}"
