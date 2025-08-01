# fees/constants.py - Enhanced for Multi-Gateway Support

# Enhanced Payment Method Choices
PAYMENT_METHODS = [
    # Gateway methods
    ("PAYSTACK_CARD", "Paystack - Card Payment"),
    ("PAYSTACK_BANK", "Paystack - Bank Transfer"),
    ("FLUTTERWAVE_CARD", "Flutterwave - Card Payment"),
    ("FLUTTERWAVE_BANK", "Flutterwave - Bank Transfer"),
    ("FLUTTERWAVE_MOBILE", "Flutterwave - Mobile Money"),
    ("STRIPE_CARD", "Stripe - Card Payment"),
    ("STRIPE_BANK", "Stripe - Bank Transfer"),
    # Traditional methods
    ("BANK_TRANSFER", "Direct Bank Transfer"),
    ("CASH", "Cash"),
    ("CHEQUE", "Cheque"),
    ("POS", "POS"),
]

# Payment Gateway Choices
PAYMENT_GATEWAYS = [
    ("PAYSTACK", "Paystack"),
    ("FLUTTERWAVE", "Flutterwave"),
    ("STRIPE", "Stripe"),
    ("MANUAL", "Manual Payment"),
]

# Gateway Transaction Status
GATEWAY_STATUS = [
    ("PENDING", "Pending"),
    ("PROCESSING", "Processing"),
    ("SUCCESS", "Success"),
    ("FAILED", "Failed"),
    ("CANCELLED", "Cancelled"),
    ("ABANDONED", "Abandoned"),
    ("REFUNDED", "Refunded"),
]

# Fee Types - Enhanced
FEE_TYPES = [
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
]

# Fee Frequency
FEE_FREQUENCY = [
    ("ANNUAL", "Annual"),
    ("TERMLY", "Termly"),
    ("MONTHLY", "Monthly"),
    ("ONE_TIME", "One Time"),
]

# Payment Status
PAYMENT_STATUS = [
    ("PENDING", "Pending"),
    ("PARTIAL", "Partial"),
    ("PAID", "Paid"),
    ("OVERDUE", "Overdue"),
    ("CANCELLED", "Cancelled"),
]

# Academic Terms
TERMS = [
    ("FIRST", "First Term"),
    ("SECOND", "Second Term"),
    ("THIRD", "Third Term"),
]

# Education Levels (if needed for fee structure)
EDUCATION_LEVELS = [
    ("NURSERY", "Nursery"),
    ("PRIMARY", "Primary"),
    ("SECONDARY", "Secondary"),
    ("UNIVERSITY", "University"),
]

# Classes (basic structure - you might need to expand based on your needs)
CLASSES = [
    ("PRENURSERY", "Pre-Nursery"),
    ("NURSERY_1", "Nursery 1"),
    ("NURSERY_2", "Nursery 2"),
    ("PRIMARY_1", "Primary 1"),
    ("PRIMARY_2", "Primary 2"),
    ("PRIMARY_3", "Primary 3"),
    ("PRIMARY_4", "Primary 4"),
    ("PRIMARY_5", "Primary 5"),
    ("PRIMARY_6", "Primary 6"),
    ("JSS_1", "JSS 1"),
    ("JSS_2", "JSS 2"),
    ("JSS_3", "JSS 3"),
    ("SS_1", "SS 1"),
    ("SS_2", "SS 2"),
    ("SS_3", "SS 3"),
]

# Currency choices (for international support)
CURRENCIES = [
    ("NGN", "Nigerian Naira"),
    ("USD", "US Dollar"),
    ("GBP", "British Pound"),
    ("EUR", "Euro"),
]

# Card Types (for payment tracking)
CARD_TYPES = [
    ("VISA", "Visa"),
    ("MASTERCARD", "Mastercard"),
    ("VERVE", "Verve"),
    ("AMERICAN_EXPRESS", "American Express"),
    ("DISCOVER", "Discover"),
]

# Webhook Event Types (common across gateways)
WEBHOOK_EVENTS = [
    ("CHARGE_SUCCESS", "Charge Success"),
    ("CHARGE_FAILED", "Charge Failed"),
    ("TRANSFER_SUCCESS", "Transfer Success"),
    ("TRANSFER_FAILED", "Transfer Failed"),
    ("REFUND_PROCESSED", "Refund Processed"),
    ("DISPUTE_CREATED", "Dispute Created"),
    ("SUBSCRIPTION_CREATED", "Subscription Created"),
    ("SUBSCRIPTION_CANCELLED", "Subscription Cancelled"),
]

# Payment priority levels (for installment plans)
PAYMENT_PRIORITIES = [
    ("HIGH", "High Priority"),
    ("MEDIUM", "Medium Priority"),
    ("LOW", "Low Priority"),
]

# Installment status
INSTALLMENT_STATUS = [
    ("UPCOMING", "Upcoming"),
    ("DUE", "Due"),
    ("OVERDUE", "Overdue"),
    ("PAID", "Paid"),
    ("CANCELLED", "Cancelled"),
]

# Common transaction limits (in Naira)
TRANSACTION_LIMITS = {
    "MIN_AMOUNT": 100.00,
    "MAX_AMOUNT": 1000000.00,
    "DAILY_LIMIT": 500000.00,
    "MONTHLY_LIMIT": 2000000.00,
}

# Gateway-specific settings
GATEWAY_SETTINGS = {
    "PAYSTACK": {
        "MIN_AMOUNT": 100.00,
        "MAX_AMOUNT": 1000000.00,
        "SUPPORTED_CURRENCIES": ["NGN", "USD", "GBP"],
        "FEE_PERCENTAGE": 1.5,
        "FIXED_CHARGE": 100.00,
    },
    "FLUTTERWAVE": {
        "MIN_AMOUNT": 100.00,
        "MAX_AMOUNT": 1000000.00,
        "SUPPORTED_CURRENCIES": ["NGN", "USD", "GBP", "EUR"],
        "FEE_PERCENTAGE": 1.4,
        "FIXED_CHARGE": 0.00,
    },
    "STRIPE": {
        "MIN_AMOUNT": 50.00,  # $0.50 USD equivalent
        "MAX_AMOUNT": 999999.99,
        "SUPPORTED_CURRENCIES": ["USD", "GBP", "EUR"],
        "FEE_PERCENTAGE": 2.9,
        "FIXED_CHARGE": 30.00,  # $0.30 USD equivalent
    },
}

# Receipt templates
RECEIPT_TYPES = [
    ("FULL_PAYMENT", "Full Payment Receipt"),
    ("PARTIAL_PAYMENT", "Partial Payment Receipt"),
    ("INSTALLMENT", "Installment Receipt"),
    ("REFUND", "Refund Receipt"),
]

# Notification types for payment events
NOTIFICATION_TYPES = [
    ("PAYMENT_SUCCESS", "Payment Successful"),
    ("PAYMENT_FAILED", "Payment Failed"),
    ("PAYMENT_PENDING", "Payment Pending"),
    ("INSTALLMENT_DUE", "Installment Due"),
    ("PAYMENT_OVERDUE", "Payment Overdue"),
    ("REFUND_PROCESSED", "Refund Processed"),
]
