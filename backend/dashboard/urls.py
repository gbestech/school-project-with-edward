# from django.urls import path
# from .views import dashboard_stats

# urlpatterns = [
#     path("stats/", dashboard_stats, name="dashboard_stats"),
# ]

from django.urls import path
from .views import dashboard_stats_function

urlpatterns = [
    path("stats/", dashboard_stats_function, name="dashboard_stats"),
]
