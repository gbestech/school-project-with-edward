# invitations/models.py
import uuid
from django.db import models
from django.utils import timezone
from users.models import CustomUser

ROLE_CHOICES = (
    ("student", "Student"),
    ("teacher", "Teacher"),
    ("parent", "Parent"),
)


class Invitation(models.Model):
    email = models.EmailField()
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    invited_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="sent_invitations"
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Invite to {self.email} as {self.role}"
