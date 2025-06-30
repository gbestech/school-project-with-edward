# fees/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Sum, Count
from django.utils import timezone
from django.http import HttpResponse
import csv
from decimal import Decimal

# Note: Student import is only needed for foreign key references in admin
from .models import (
    AcademicSession,
    FeeStructure,
    StudentFee,
    Payment,
    FeeDiscount,
    StudentDiscount,
    PaymentReminder,
)


class StudentFeeInline(admin.TabularInline):
    model = StudentFee
    extra = 0
    fields = ("fee_structure", "amount_due", "amount_paid", "due_date", "status")
    readonly_fields = ("created_at", "updated_at")


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ("reference", "amount", "payment_method", "verified", "payment_date")
    readonly_fields = ("payment_date", "created_at")


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "fee_type",
        "education_level",
        "student_class",
        "amount",
        "frequency",
        "is_active",
        "created_at",
    )
    list_filter = (
        "fee_type",
        "education_level",
        "frequency",
        "is_active",
        "created_at",
    )
    search_fields = ("name", "fee_type", "description")

    fieldsets = (
        ("Basic Information", {"fields": ("name", "fee_type", "description")}),
        (
            "Class Information",
            {"fields": ("education_level", "student_class", "academic_session")},
        ),
        (
            "Amount Settings",
            {
                "fields": (
                    "amount",
                    "frequency",
                    "is_mandatory",
                    "due_date_offset",
                    "late_fee_percentage",
                )
            },
        ),
        (
            "Settings",
            {"fields": ("is_active",)},
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("academic_session")


@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "fee_structure",
        "amount_due",
        "amount_paid",
        "balance",
        "status",
        "due_date",
        "payment_percentage_display",
        "created_at",
    )
    list_filter = (
        "status",
        "fee_structure__fee_type",
        "due_date",
        "created_at",
        "academic_session",
        "term",
    )
    search_fields = (
        "student__user__first_name",
        "student__user__last_name",
        "student__student_id",
        "fee_structure__name",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
        "balance",
        "payment_percentage",
        "is_overdue",
    )
    date_hierarchy = "due_date"

    fieldsets = (
        (
            "Student Information",
            {"fields": ("student", "academic_session", "term")},
        ),
        (
            "Fee Details",
            {
                "fields": (
                    "fee_structure",
                    "amount_due",
                    "discount_amount",
                    "late_fee",
                    "due_date",
                )
            },
        ),
        (
            "Payment Info",
            {"fields": ("amount_paid", "balance", "payment_percentage", "status")},
        ),
        (
            "Additional Information",
            {
                "fields": ("remarks", "is_overdue", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    actions = [
        "mark_as_paid",
        "send_payment_reminder",
        "export_as_csv",
        "update_payment_status",
    ]
    inlines = [PaymentInline]

    def payment_percentage_display(self, obj):
        percentage = obj.payment_percentage
        if percentage >= 100:
            color = "green"
        elif percentage > 0:
            color = "orange"
        else:
            color = "red"

        return format_html('<span style="color: {};">{:.1f}%</span>', color, percentage)

    payment_percentage_display.short_description = "Payment %"

    def mark_as_paid(self, request, queryset):
        updated = 0
        for fee in queryset:
            fee.amount_paid = fee.amount_due
            fee.status = "PAID"
            fee.save()
            updated += 1
        self.message_user(request, f"{updated} fees marked as paid.")

    mark_as_paid.short_description = "Mark selected fees as paid"

    def send_payment_reminder(self, request, queryset):
        count = 0
        for fee in queryset:
            if fee.status not in ["PAID"]:
                PaymentReminder.objects.create(
                    student_fee=fee,
                    reminder_type="EMAIL",
                    message=f"Payment reminder for {fee.fee_structure.name}",
                )
                count += 1
        self.message_user(request, f"Reminders created for {count} fees.")

    send_payment_reminder.short_description = "Send payment reminders"

    def update_payment_status(self, request, queryset):
        updated = 0
        for fee in queryset:
            fee.update_status()
            updated += 1
        self.message_user(request, f"{updated} fee statuses updated.")

    update_payment_status.short_description = "Update payment status"

    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="student_fees.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "Student ID",
                "Student Name",
                "Fee Type",
                "Amount Due",
                "Amount Paid",
                "Balance",
                "Status",
                "Due Date",
                "Created",
            ]
        )

        for fee in queryset:
            writer.writerow(
                [
                    fee.student.student_id,
                    fee.student.full_name,
                    fee.fee_structure.name,
                    fee.amount_due,
                    fee.amount_paid,
                    fee.balance,
                    fee.status,
                    fee.due_date,
                    fee.created_at.strftime("%Y-%m-%d"),
                ]
            )

        return response

    export_as_csv.short_description = "Export selected fees as CSV"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "student_name",
        "amount",
        "payment_method",
        "verified",
        "paystack_status",
        "payment_date",
    )
    list_filter = (
        "payment_method",
        "verified",
        "paystack_status",
        "payment_date",
        "verification_date",
    )
    search_fields = (
        "reference",
        "paystack_reference",
        "student_fee__student__user__first_name",
        "student_fee__student__user__last_name",
        "student_fee__student__student_id",
        "payer_email",
    )
    readonly_fields = (
        "id",
        "reference",
        "paystack_reference",
        "paystack_transaction_id",
        "payment_date",
        "verification_date",
        "created_at",
        "updated_at",
        "receipt_number",
    )
    date_hierarchy = "payment_date"

    fieldsets = (
        (
            "Payment Information",
            {"fields": ("student_fee", "reference", "amount", "payment_method")},
        ),
        ("Payer Details", {"fields": ("payer_name", "payer_email", "description")}),
        (
            "Paystack Details",
            {
                "fields": (
                    "paystack_reference",
                    "paystack_transaction_id",
                    "paystack_status",
                )
            },
        ),
        (
            "Verification",
            {"fields": ("verified", "verification_date", "receipt_number")},
        ),
        (
            "Timestamps",
            {
                "fields": ("payment_date", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    actions = ["verify_payments", "export_successful_payments", "generate_receipts"]

    def student_name(self, obj):
        return obj.student_fee.student.full_name

    student_name.short_description = "Student"

    def verify_payments(self, request, queryset):
        verified_count = 0
        for payment in queryset.filter(verified=False):
            # Here you would integrate with your payment verification service
            payment.verified = True
            payment.verification_date = timezone.now()
            payment.save()
            verified_count += 1

        self.message_user(request, f"{verified_count} payments verified successfully.")

    verify_payments.short_description = "Verify selected payments"

    def generate_receipts(self, request, queryset):
        generated_count = 0
        for payment in queryset.filter(verified=True, receipt_number__isnull=True):
            payment.generate_receipt_number()
            generated_count += 1

        self.message_user(request, f"{generated_count} receipt numbers generated.")

    generate_receipts.short_description = "Generate receipt numbers"

    def export_successful_payments(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="successful_payments.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(
            [
                "Reference",
                "Student",
                "Amount",
                "Payment Method",
                "Paystack Status",
                "Verified",
                "Date",
                "Receipt Number",
            ]
        )

        for payment in queryset.filter(verified=True):
            writer.writerow(
                [
                    payment.reference,
                    payment.student_fee.student.full_name,
                    payment.amount,
                    payment.payment_method,
                    payment.paystack_status or "N/A",
                    "Yes" if payment.verified else "No",
                    payment.payment_date.strftime("%Y-%m-%d %H:%M"),
                    payment.receipt_number or "Not Generated",
                ]
            )

        return response

    export_successful_payments.short_description = "Export successful payments"


# Note: Student model is already registered in students/admin.py
# If you need to add fee-related functionality to Student admin,
# you can extend it there by adding the StudentFeeInline


@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ("name", "start_date", "end_date", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)

    fieldsets = (
        ("Session Details", {"fields": ("name", "start_date", "end_date")}),
        ("Status", {"fields": ("is_active",)}),
    )


@admin.register(FeeDiscount)
class FeeDiscountAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "discount_type",
        "value",
        "is_active",
        "valid_from",
        "valid_to",
        "created_at",
    )
    list_filter = ("discount_type", "is_active", "valid_from", "valid_to")
    search_fields = ("name", "description")

    fieldsets = (
        ("Discount Details", {"fields": ("name", "description")}),
        (
            "Discount Settings",
            {"fields": ("discount_type", "value", "applicable_fee_types")},
        ),
        ("Validity", {"fields": ("valid_from", "valid_to", "is_active")}),
    )

    filter_horizontal = ("applicable_fee_types",)


@admin.register(StudentDiscount)
class StudentDiscountAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "discount",
        "academic_session",
        "applied_by",
        "applied_date",
        "is_active",
    )
    list_filter = ("discount", "academic_session", "is_active", "applied_date")
    search_fields = (
        "student__user__first_name",
        "student__user__last_name",
        "student__student_id",
        "discount__name",
    )
    readonly_fields = ("applied_date",)

    fieldsets = (
        ("Assignment Details", {"fields": ("student", "discount", "academic_session")}),
        ("Applied By", {"fields": ("applied_by", "applied_date", "is_active")}),
    )


@admin.register(PaymentReminder)
class PaymentReminderAdmin(admin.ModelAdmin):
    list_display = (
        "student_fee",
        "reminder_type",
        "sent_date",
        "is_sent",
    )
    list_filter = ("reminder_type", "is_sent", "sent_date")
    search_fields = (
        "student_fee__student__user__first_name",
        "student_fee__student__user__last_name",
    )
    readonly_fields = ("sent_date",)

    fieldsets = (
        ("Reminder Details", {"fields": ("student_fee", "reminder_type")}),
        ("Message", {"fields": ("message",)}),
        ("Status", {"fields": ("is_sent", "sent_date")}),
    )


# Custom admin site configuration
admin.site.site_header = "Fees Management System"
admin.site.site_title = "Fees Admin"
admin.site.index_title = "Welcome to Fees Management System"


# Add custom CSS for better styling
class AdminStyleMixin:
    class Media:
        css = {"all": ("admin/css/custom_admin.css",)}
        js = ("admin/js/custom_admin.js",)
