from utils.email import send_email_via_brevo
from django.http import JsonResponse


def test_email_view(request):
    subject = "Test Email"
    html_content = "<p>This is a test email sent via Brevo API.</p>"
    to_email = "edwardaja750@gmai.com"  # Replace with your email

    status_code, response_text = send_email_via_brevo(subject, html_content, to_email)

    return JsonResponse({"status_code": status_code, "response": response_text})
