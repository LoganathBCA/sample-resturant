from django.urls import path
from . import views

# /dashboard/ endpoints
urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
]
