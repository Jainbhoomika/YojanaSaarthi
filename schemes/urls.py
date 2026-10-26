from django.urls import path
from . import views

urlpatterns = [
    path("api/schemes/", views.scheme_list, name="scheme-list"),
    path("api/schemes/<int:scheme_id>/", views.scheme_detail, name="scheme-detail"),
]