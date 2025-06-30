# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework import serializers
# from django.contrib.auth import authenticate, get_user_model
# from django.contrib.auth.password_validation import validate_password
# from rest_framework.exceptions import ValidationError

# User = get_user_model()


# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, attrs):
#         email = attrs.get("email")
#         password = attrs.get("password")

#         if email and password:
#             user = authenticate(
#                 self.context["request"], username=email, password=password
#             )
#             if not user:
#                 raise serializers.ValidationError(
#                     "No active account found with the given credentials"
#                 )
#             if not user.is_active:
#                 raise serializers.ValidationError("User account is disabled.")
#         else:
#             raise serializers.ValidationError("Must include 'email' and 'password'.")

#         # ✅ Validate parent linkage after successful login
#         if user.role == "parent":
#             if (
#                 not hasattr(user, "parent_profile")
#                 or not user.parent_profile.students.exists()
#             ):
#                 raise ValidationError("No linked students. Contact the administrator.")

#         self.user = user

#         data = super().validate({"username": user.email, "password": password})

#         # Add extra fields to the response
#         data["id"] = user.id
#         data["email"] = user.email
#         data["first_name"] = user.first_name
#         data["last_name"] = user.last_name
#         data["role"] = user.role

#         return data

#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         # Add custom claims to the token
#         token["id"] = user.id
#         token["email"] = user.email
#         token["role"] = user.role
#         token["is_staff"] = user.is_staff
#         return token

#     def to_representation(self, instance):
#         return {
#             "id": instance.id,
#             "email": instance.email,
#             "first_name": instance.first_name,
#             "last_name": instance.last_name,
#             "role": instance.role,
#         }


# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, validators=[validate_password])
#     password_confirm = serializers.CharField(write_only=True)
#     email = serializers.EmailField(required=True)

#     class Meta:
#         model = User
#         fields = (
#             "username",
#             "email",
#             "password",
#             "password_confirm",
#             "first_name",
#             "last_name",
#             "role",
#         )
#         extra_kwargs = {
#             "first_name": {"required": True},
#             "last_name": {"required": True},
#         }

#     def validate_email(self, value):
#         if User.objects.filter(email=value).exists():
#             raise serializers.ValidationError("A user with this email already exists.")
#         return value

#     def validate_username(self, value):
#         if User.objects.filter(username=value).exists():
#             raise serializers.ValidationError(
#                 "A user with this username already exists."
#             )
#         return value

#     def validate(self, attrs):
#         if attrs["password"] != attrs["password_confirm"]:
#             raise serializers.ValidationError("Passwords don't match.")
#         return attrs

#     def create(self, validated_data):
#         validated_data.pop("password_confirm")
#         password = validated_data.pop("password")

#         user = User.objects.create_user(password=password, **validated_data)
#         return user


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(
                self.context["request"], username=email, password=password
            )
            if not user:
                raise serializers.ValidationError(
                    "No active account found with the given credentials"
                )
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

        # ✅ Validate parent linkage after successful login
        if user.role == "parent":
            if (
                not hasattr(user, "parent_profile")
                or not user.parent_profile.students.exists()
            ):
                raise ValidationError("No linked students. Contact the administrator.")

        self.user = user

        data = super().validate({"username": user.email, "password": password})

        # Add extra fields to the response
        data["id"] = user.id
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["role"] = user.role

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the token
        token["id"] = user.id
        token["email"] = user.email
        token["role"] = user.role
        token["is_staff"] = user.is_staff
        return token

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "email": instance.email,
            "first_name": instance.first_name,
            "last_name": instance.last_name,
            "role": instance.role,
        }


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "role",
        )
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User.objects.create_user(password=password, **validated_data)
        return user
