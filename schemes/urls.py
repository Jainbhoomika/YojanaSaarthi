
from django.urls import path
from . import views

urlpatterns = [
    path("", views.scheme_form, name="scheme_form"),
    path("api/schemes/", views.scheme_list, name="scheme-list"),
    path("api/schemes/<int:scheme_id>/", views.scheme_detail, name="scheme-detail"),
    path("api/recommendations/", views.recommendation_api, name="recommendation-api"),
]