# invitations/urls.py
from django.urls import path
from django.urls import path
from .views import InviteStudentView, RetrieveInvitationView, AcceptInvitationView


urlpatterns = [
    path("send/", InviteStudentView.as_view(), name="send-invite"),
    path("<uuid:token>/", RetrieveInvitationView.as_view(), name="get-invite"),
    path("accept/", AcceptInvitationView.as_view(), name="accept-invite"),
]
