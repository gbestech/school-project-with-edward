# fees/urls.py
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from . import views
from .views import (
    # Dashboard views
    FeesDashboardView,
    StudentDashboardView,
    PaymentHistoryView,
    # Fee management views
    FeeListView,
    FeeDetailView,
    FeeCreateView,
    FeeUpdateView,
    FeeDeleteView,
    # Payment views
    PaymentInitializeView,
    PaymentVerifyView,
    PaymentCallbackView,
    PaymentHistoryListView,
    PaymentDetailView,
    # Student views
    StudentFeeListView,
    StudentPaymentHistoryView,
    StudentProfileView,
    # API views
    PaymentAPIView,
    FeeAPIView,
    TransactionAPIView,
    # Webhook views
    PaystackWebhookView,
    # Report views
    PaymentReportView,
    FeesReportView,
    StudentReportView,
    # Utility views
    DownloadReceiptView,
    DownloadInvoiceView,
    PrintReceiptView,
    # Refund views
    RefundRequestView,
    RefundListView,
    RefundDetailView,
    # Subscription views
    SubscriptionCreateView,
    SubscriptionListView,
    SubscriptionDetailView,
    # Transfer views
    TransferInitiateView,
    TransferListView,
    TransferDetailView,
)

app_name = "fees"

# Main URL patterns
urlpatterns = [
    # Dashboard URLs
    path("", FeesDashboardView.as_view(), name="dashboard"),
    path(
        "student-dashboard/", StudentDashboardView.as_view(), name="student_dashboard"
    ),
    path("payment-history/", PaymentHistoryView.as_view(), name="payment_history"),
    # Fee Management URLs
    path("fees/", FeeListView.as_view(), name="fee_list"),
    path("fees/create/", FeeCreateView.as_view(), name="fee_create"),
    path("fees/<int:pk>/", FeeDetailView.as_view(), name="fee_detail"),
    path("fees/<int:pk>/edit/", FeeUpdateView.as_view(), name="fee_edit"),
    path("fees/<int:pk>/delete/", FeeDeleteView.as_view(), name="fee_delete"),
    # Payment URLs
    path("payments/", PaymentHistoryListView.as_view(), name="payment_list"),
    path("payments/<int:pk>/", PaymentDetailView.as_view(), name="payment_detail"),
    path(
        "payments/initialize/",
        PaymentInitializeView.as_view(),
        name="payment_initialize",
    ),
    path(
        "payments/verify/<str:reference>/",
        PaymentVerifyView.as_view(),
        name="payment_verify",
    ),
    path("payments/callback/", PaymentCallbackView.as_view(), name="payment_callback"),
    # Student-specific URLs
    path(
        "student/",
        include(
            [
                path("fees/", StudentFeeListView.as_view(), name="student_fees"),
                path(
                    "payments/",
                    StudentPaymentHistoryView.as_view(),
                    name="student_payments",
                ),
                path("profile/", StudentProfileView.as_view(), name="student_profile"),
            ]
        ),
    ),
    # Webhook URLs
    path(
        "webhooks/",
        include(
            [
                path(
                    "paystack/",
                    csrf_exempt(PaystackWebhookView.as_view()),
                    name="paystack_webhook",
                ),
            ]
        ),
    ),
    # Report URLs
    path(
        "reports/",
        include(
            [
                path("payments/", PaymentReportView.as_view(), name="payment_reports"),
                path("fees/", FeesReportView.as_view(), name="fees_reports"),
                path("students/", StudentReportView.as_view(), name="student_reports"),
            ]
        ),
    ),
    # Utility URLs
    path(
        "receipts/",
        include(
            [
                path(
                    "<str:reference>/download/",
                    DownloadReceiptView.as_view(),
                    name="download_receipt",
                ),
                path(
                    "<str:reference>/print/",
                    PrintReceiptView.as_view(),
                    name="print_receipt",
                ),
            ]
        ),
    ),
    path(
        "invoices/",
        include(
            [
                path(
                    "<int:fee_id>/download/",
                    DownloadInvoiceView.as_view(),
                    name="download_invoice",
                ),
            ]
        ),
    ),
    # Refund URLs
    path(
        "refunds/",
        include(
            [
                path("", RefundListView.as_view(), name="refund_list"),
                path("request/", RefundRequestView.as_view(), name="refund_request"),
                path("<int:pk>/", RefundDetailView.as_view(), name="refund_detail"),
            ]
        ),
    ),
    # Subscription URLs
    path(
        "subscriptions/",
        include(
            [
                path("", SubscriptionListView.as_view(), name="subscription_list"),
                path(
                    "create/",
                    SubscriptionCreateView.as_view(),
                    name="subscription_create",
                ),
                path(
                    "<int:pk>/",
                    SubscriptionDetailView.as_view(),
                    name="subscription_detail",
                ),
            ]
        ),
    ),
    # Transfer URLs
    path(
        "transfers/",
        include(
            [
                path("", TransferListView.as_view(), name="transfer_list"),
                path(
                    "initiate/",
                    TransferInitiateView.as_view(),
                    name="transfer_initiate",
                ),
                path("<int:pk>/", TransferDetailView.as_view(), name="transfer_detail"),
            ]
        ),
    ),
]

# API URLs
api_patterns = [
    path(
        "api/v1/",
        include(
            [
                # Authentication
                path(
                    "auth/",
                    include(
                        [
                            path(
                                "login/", views.APILoginView.as_view(), name="api_login"
                            ),
                            path(
                                "logout/",
                                views.APILogoutView.as_view(),
                                name="api_logout",
                            ),
                            path(
                                "refresh/",
                                views.APIRefreshTokenView.as_view(),
                                name="api_refresh",
                            ),
                        ]
                    ),
                ),
                # Fees API
                path(
                    "fees/",
                    include(
                        [
                            path("", FeeAPIView.as_view(), name="api_fees"),
                            path(
                                "<int:pk>/", FeeAPIView.as_view(), name="api_fee_detail"
                            ),
                            path(
                                "student/<str:student_id>/",
                                views.StudentFeesAPIView.as_view(),
                                name="api_student_fees",
                            ),
                        ]
                    ),
                ),
                # Payments API
                path(
                    "payments/",
                    include(
                        [
                            path("", PaymentAPIView.as_view(), name="api_payments"),
                            path(
                                "<int:pk>/",
                                PaymentAPIView.as_view(),
                                name="api_payment_detail",
                            ),
                            path(
                                "initialize/",
                                views.PaymentInitializeAPIView.as_view(),
                                name="api_payment_initialize",
                            ),
                            path(
                                "verify/<str:reference>/",
                                views.PaymentVerifyAPIView.as_view(),
                                name="api_payment_verify",
                            ),
                        ]
                    ),
                ),
                # Transactions API
                path(
                    "transactions/",
                    include(
                        [
                            path(
                                "",
                                TransactionAPIView.as_view(),
                                name="api_transactions",
                            ),
                            path(
                                "<int:pk>/",
                                TransactionAPIView.as_view(),
                                name="api_transaction_detail",
                            ),
                        ]
                    ),
                ),
                # Students API
                path(
                    "students/",
                    include(
                        [
                            path(
                                "", views.StudentAPIView.as_view(), name="api_students"
                            ),
                            path(
                                "<str:student_id>/",
                                views.StudentDetailAPIView.as_view(),
                                name="api_student_detail",
                            ),
                            path(
                                "<str:student_id>/fees/",
                                views.StudentFeesAPIView.as_view(),
                                name="api_student_fees",
                            ),
                            path(
                                "<str:student_id>/payments/",
                                views.StudentPaymentsAPIView.as_view(),
                                name="api_student_payments",
                            ),
                        ]
                    ),
                ),
                # Reports API
                path(
                    "reports/",
                    include(
                        [
                            path(
                                "payments/",
                                views.PaymentReportAPIView.as_view(),
                                name="api_payment_reports",
                            ),
                            path(
                                "fees/",
                                views.FeesReportAPIView.as_view(),
                                name="api_fees_reports",
                            ),
                            path(
                                "transactions/",
                                views.TransactionReportAPIView.as_view(),
                                name="api_transaction_reports",
                            ),
                        ]
                    ),
                ),
                # Utilities API
                path(
                    "utils/",
                    include(
                        [
                            path(
                                "banks/",
                                views.BankListAPIView.as_view(),
                                name="api_banks",
                            ),
                            path(
                                "resolve-account/",
                                views.ResolveAccountAPIView.as_view(),
                                name="api_resolve_account",
                            ),
                            path(
                                "exchange-rates/",
                                views.ExchangeRateAPIView.as_view(),
                                name="api_exchange_rates",
                            ),
                        ]
                    ),
                ),
            ]
        ),
    ),
]

# Add API patterns to main urlpatterns
urlpatterns += api_patterns

# AJAX URLs for dynamic content
ajax_patterns = [
    path(
        "ajax/",
        include(
            [
                path(
                    "fees/search/",
                    views.FeeSearchAJAXView.as_view(),
                    name="ajax_fee_search",
                ),
                path(
                    "students/search/",
                    views.StudentSearchAJAXView.as_view(),
                    name="ajax_student_search",
                ),
                path(
                    "payments/status/<str:reference>/",
                    views.PaymentStatusAJAXView.as_view(),
                    name="ajax_payment_status",
                ),
                path(
                    "fees/calculate/",
                    views.FeeCalculateAJAXView.as_view(),
                    name="ajax_fee_calculate",
                ),
                path(
                    "dashboard/stats/",
                    views.DashboardStatsAJAXView.as_view(),
                    name="ajax_dashboard_stats",
                ),
            ]
        ),
    ),
]

urlpatterns += ajax_patterns

# Export URLs
export_patterns = [
    path(
        "exports/",
        include(
            [
                path(
                    "fees/csv/",
                    views.ExportFeesCSVView.as_view(),
                    name="export_fees_csv",
                ),
                path(
                    "fees/excel/",
                    views.ExportFeesExcelView.as_view(),
                    name="export_fees_excel",
                ),
                path(
                    "payments/csv/",
                    views.ExportPaymentsCSVView.as_view(),
                    name="export_payments_csv",
                ),
                path(
                    "payments/excel/",
                    views.ExportPaymentsExcelView.as_view(),
                    name="export_payments_excel",
                ),
                path(
                    "students/csv/",
                    views.ExportStudentsCSVView.as_view(),
                    name="export_students_csv",
                ),
                path(
                    "transactions/csv/",
                    views.ExportTransactionsCSVView.as_view(),
                    name="export_transactions_csv",
                ),
            ]
        ),
    ),
]

urlpatterns += export_patterns

# Bulk operations URLs
bulk_patterns = [
    path(
        "bulk/",
        include(
            [
                path(
                    "fees/create/",
                    views.BulkFeeCreateView.as_view(),
                    name="bulk_fee_create",
                ),
                path(
                    "fees/update/",
                    views.BulkFeeUpdateView.as_view(),
                    name="bulk_fee_update",
                ),
                path(
                    "payments/verify/",
                    views.BulkPaymentVerifyView.as_view(),
                    name="bulk_payment_verify",
                ),
                path(
                    "reminders/send/",
                    views.BulkReminderSendView.as_view(),
                    name="bulk_reminder_send",
                ),
                path(
                    "import/fees/", views.ImportFeesView.as_view(), name="import_fees"
                ),
                path(
                    "import/students/",
                    views.ImportStudentsView.as_view(),
                    name="import_students",
                ),
            ]
        ),
    ),
]

urlpatterns += bulk_patterns

# Admin enhancement URLs
admin_patterns = [
    path(
        "admin-tools/",
        include(
            [
                path(
                    "payment-verification/",
                    views.AdminPaymentVerificationView.as_view(),
                    name="admin_payment_verification",
                ),
                path(
                    "refund-processing/",
                    views.AdminRefundProcessingView.as_view(),
                    name="admin_refund_processing",
                ),
                path(
                    "system-health/",
                    views.SystemHealthCheckView.as_view(),
                    name="system_health",
                ),
                path("audit-logs/", views.AuditLogsView.as_view(), name="audit_logs"),
            ]
        ),
    ),
]

urlpatterns += admin_patterns

# Mobile app URLs
mobile_patterns = [
    path(
        "mobile/v1/",
        include(
            [
                path(
                    "auth/login/", views.MobileLoginView.as_view(), name="mobile_login"
                ),
                path(
                    "student/dashboard/",
                    views.MobileStudentDashboardView.as_view(),
                    name="mobile_student_dashboard",
                ),
                path(
                    "student/fees/",
                    views.MobileStudentFeesView.as_view(),
                    name="mobile_student_fees",
                ),
                path(
                    "student/payments/",
                    views.MobileStudentPaymentsView.as_view(),
                    name="mobile_student_payments",
                ),
                path(
                    "payment/initialize/",
                    views.MobilePaymentInitializeView.as_view(),
                    name="mobile_payment_initialize",
                ),
                path(
                    "payment/verify/",
                    views.MobilePaymentVerifyView.as_view(),
                    name="mobile_payment_verify",
                ),
            ]
        ),
    ),
]

urlpatterns += mobile_patterns

# Testing URLs (only in development)
from django.conf import settings

if settings.DEBUG:
    test_patterns = [
        path(
            "test/",
            include(
                [
                    path(
                        "payment-flow/",
                        views.TestPaymentFlowView.as_view(),
                        name="test_payment_flow",
                    ),
                    path(
                        "webhook-test/",
                        views.TestWebhookView.as_view(),
                        name="test_webhook",
                    ),
                    path(
                        "email-test/", views.TestEmailView.as_view(), name="test_email"
                    ),
                    path("sms-test/", views.TestSMSView.as_view(), name="test_sms"),
                ]
            ),
        ),
    ]
    urlpatterns += test_patterns

# Error handling URLs
handler404 = "fees.views.custom_404_view"
handler500 = "fees.views.custom_500_view"
handler403 = "fees.views.custom_403_view"
