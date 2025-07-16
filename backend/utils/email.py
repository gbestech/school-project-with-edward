import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

api_key = settings.BREVO_API_KEY


def send_email_via_brevo(subject, html_content, to_email):
    # Check if API key is properly configured
    if not api_key or api_key == "your-brevo-api-key-here":
        logger.warning("Brevo API key not configured. Using console email backend.")
        # Fallback to console email backend for development
        from django.core.mail import send_mail
        from django.conf import settings
        
        try:
            send_mail(
                subject=subject,
                message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Email sent to {to_email} via console backend")
            return 200, "Email sent via console backend"
        except Exception as e:
            logger.error(f"Console email sending failed: {e}")
            return None, str(e)
    
    url = "https://api.brevo.com/v3/smtp/email"

    payload = {
        "sender": {
            "name": "SchoolMS",
            "email": "edwardaja750@gmail.com",  # Must be verified in Brevo
        },
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content,
    }

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        logger.info(f"Email sent to {to_email}. Status: {response.status_code}")
        
        if response.status_code == 401:
            logger.error(f"Brevo API authentication failed. Check your API key. Response: {response.text}")
            return response.status_code, "Brevo API authentication failed. Check your API key."
        elif response.status_code != 201:
            logger.error(f"Brevo API error. Status: {response.status_code}, Response: {response.text}")
            return response.status_code, response.text
            
        return response.status_code, response.text
    except requests.exceptions.RequestException as e:
        logger.error(f"Email sending failed: {e}")
        return None, str(e)
