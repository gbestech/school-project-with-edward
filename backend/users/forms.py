# users/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ("email", "first_name", "middle_name", "last_name", "role")

    def save(self, commit=True):
        user = super().save(commit=False)
        # Generate username from email
        email_prefix = user.email.split('@')[0]
        base_username = email_prefix
        
        # Ensure username is unique
        counter = 1
        username = base_username
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        user.username = username
        
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ("email", "first_name", "middle_name", "last_name", "role")
