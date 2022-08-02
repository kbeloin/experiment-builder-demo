from .views import UploadFileView, PresignedUrlView
from django.urls import path

urlpatterns = [
    path('upload/', UploadFileView.as_view(), name='upload'),
    path('presigned/', PresignedUrlView.as_view(), name='presigned'),
]