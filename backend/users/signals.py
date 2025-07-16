from django.dispatch import receiver
from allauth.account.signals import email_confirmed
from utils.email import send_email_via_brevo


@receiver(email_confirmed)
def send_welcome_email(request, email_address, **kwargs):
    subject = "🎉 Welcome to God's Treasure Schools"
    html_content = f"""
    <h2>Hi {email_address.user.full_name},</h2>
    <p>Welcome! Your email has been confirmed successfully.</p>
    <p>Get started by logging into your dashboard.</p>
    <br/>
    <p>– AI Hustle Daily Team</p>
    """
    send_email_via_brevo(subject, html_content, email_address.email)
