# fees/utils.py
import uuid
from decimal import Decimal
from django.utils import timezone


def generate_receipt_number():
    """Generate unique receipt number"""
    timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
    return f"RCT-{timestamp}-{uuid.uuid4().hex[:6].upper()}"


def calculate_discount_amount(amount, discount):
    """Calculate discount amount"""
    if discount.discount_type == "PERCENTAGE":
        return (amount * Decimal(discount.value)) / 100
    return Decimal(discount.value)


def format_currency(amount):
    """Format amount as currency"""
    return f"₦{amount:,.2f}"
