# from django.contrib.auth.backends import BaseBackend
# from django.contrib.auth import get_user_model

# User = get_user_model()


# class EmailBackend(BaseBackend):
#     def authenticate(self, request, username=None, password=None, email=None, **kwargs):
#         try:
#             # Support both username and email parameters
#             email_to_use = email or username
#             if not email_to_use:
#                 return None
#             # Use email_to_use for lookup
#             user = User.objects.get(email=email_to_use)
#         except User.DoesNotExist:
#             return None

#         if user.check_password(password) and self.user_can_authenticate(user):
#             return user
#         return None

#     def get_user(self, user_id):
#         try:
#             return User.objects.get(pk=user_id)
#         except User.DoesNotExist:
#             return None

#     def user_can_authenticate(self, user):
#         # You can add your own conditions here, for example:
#         return user.is_active

# authentication/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        try:
            # Try to find user by username first, then email
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                # If not found by username, try email
                # FIX: Filter by school too if multiple users share email
                user = User.objects.filter(email=username).first()  # Get first match

            if (
                user
                and user.check_password(password)
                and self.user_can_authenticate(user)
            ):
                return user
        except User.MultipleObjectsReturned:
            # If multiple users with same email, try to find by username=email
            return None
        except User.DoesNotExist:
            return None

        return None
