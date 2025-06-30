from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import StudentFee, Payment


@receiver(post_save, sender=Payment)
def update_student_fee_on_payment(sender, instance, created, **kwargs):
    """Update student fee status when payment is made"""
    if created and instance.verified:
        student_fee = instance.student_fee
        student_fee.amount_paid += instance.amount

        if student_fee.amount_paid >= student_fee.amount_due:
            student_fee.status = "PAID"
        elif student_fee.amount_paid > 0:
            student_fee.status = "PARTIAL"

        student_fee.save()


@receiver(pre_save, sender=StudentFee)
def update_overdue_status(sender, instance, **kwargs):
    """Update overdue status based on due date"""
    if instance.due_date < timezone.now().date() and instance.status in [
        "PENDING",
        "PARTIAL",
    ]:
        instance.status = "OVERDUE"
