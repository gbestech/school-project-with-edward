import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

api_key = settings.BREVO_API_KEY


def send_email_via_brevo(subject, html_content, to_email):
    url = "https://api.brevo.com/v3/smtp/email"

    payload = {
        "sender": {
            "name": "SchoolMS",
            "email": "aidailyhustle750@gmail.com",  # Must be verified in Brevo
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
        return response.status_code, response.text
    except requests.exceptions.RequestException as e:
        logger.error(f"Email sending failed: {e}")
        return None, str(e)
