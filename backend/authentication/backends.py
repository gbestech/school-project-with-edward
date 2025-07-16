from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        try:
            # Support both username and email parameters
            email_to_use = email or username
            if not email_to_use:
                return None
            # Use email_to_use for lookup
            user = User.objects.get(email=email_to_use)
        except User.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def user_can_authenticate(self, user):
        # You can add your own conditions here, for example:
        return user.is_active
