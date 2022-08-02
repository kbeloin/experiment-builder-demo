from django.urls import path
from api.views import CompletedExperimentListView, CompletedExperimentCreateView

urlpatterns = [
    path('', CompletedExperimentListView.as_view()),
    path('create/', CompletedExperimentCreateView.as_view()),
]