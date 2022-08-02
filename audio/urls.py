from .views import ProcessedAudioView
from django.urls import path

urlpatterns = [
    path('process/', ProcessedAudioView.as_view(), name='audio'),
]