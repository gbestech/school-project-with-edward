# fees/tasks.py
from celery import shared_task
from django.utils import timezone
from .models import StudentFee, PaymentReminder


@shared_task
def send_payment_reminders():
    """Send automated payment reminders"""
    overdue_fees = StudentFee.objects.filter(
        status="OVERDUE", due_date__lt=timezone.now().date()
    )

    for fee in overdue_fees:
        # Send reminder logic
        PaymentReminder.objects.create(
            student_fee=fee,
            reminder_type="EMAIL",
            message=f"Payment reminder for {fee.fee_structure.name}",
        )


@shared_task
def update_overdue_fees():
    """Update overdue fee statuses"""
    StudentFee.objects.filter(
        due_date__lt=timezone.now().date(), status__in=["PENDING", "PARTIAL"]
    ).update(status="OVERDUE")
