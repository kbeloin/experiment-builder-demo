from django.urls import path
from api.views import CompletedModuleListView, CompletedModuleCreateView

urlpatterns = [
    path('', CompletedModuleListView.as_view()),
    path('create/', CompletedModuleCreateView.as_view()),
]