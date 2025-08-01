from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import models
from django.utils import timezone
from .models import Payment, StudentFee  # Import Payment and StudentFee models


@receiver(post_save, sender=Payment)
def update_student_fee_on_payment(sender, instance, created, **kwargs):
    """Update student fee status when payment is made"""
    if instance.verified:  # Only process verified payments
        student_fee = instance.student_fee

        # Calculate total verified payments
        total_paid = (
            student_fee.payments.filter(verified=True).aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0
        )

        # Update student fee amount paid
        if student_fee.amount_paid != total_paid:
            student_fee.amount_paid = total_paid

            # Update status based on payment
            if student_fee.amount_paid >= student_fee.amount_due:
                student_fee.status = "PAID"
            elif student_fee.amount_paid > 0:
                student_fee.status = "PARTIAL"

            # Save without triggering signals again
            student_fee.save(update_fields=["amount_paid", "status"])


@receiver(pre_save, sender=StudentFee)
def update_overdue_status(sender, instance, **kwargs):
    """Update overdue status based on due date"""
    if hasattr(instance, "due_date") and instance.due_date:
        if instance.due_date < timezone.now().date() and instance.status in [
            "PENDING",
            "PARTIAL",
        ]:
            instance.status = "OVERDUE"


@receiver(post_save, sender=Payment)
def generate_receipt_on_verification(sender, instance, created, **kwargs):
    """Generate receipt number when payment is verified"""
    if instance.verified and not instance.receipt_number:
        instance.generate_receipt_number()
