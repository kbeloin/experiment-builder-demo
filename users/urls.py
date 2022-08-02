
from rest_framework.routers import DefaultRouter
from django.urls import include, path
from .views import UserViewSet, ParticipantListView

router = DefaultRouter()
router.register(r'', UserViewSet, basename='users')                                                                

urlpatterns = [ 
    path('/', include(router.urls)),
    path('participants/', ParticipantListView.as_view(), name="participants"),
]
