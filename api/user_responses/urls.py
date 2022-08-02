from rest_framework.routers import DefaultRouter
from api.views import UserResponseListView


router = DefaultRouter()
router.register(r'', UserResponseListView, basename='userresponse')
urlpatterns = router.urls