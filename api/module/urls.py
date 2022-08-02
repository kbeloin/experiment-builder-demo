from rest_framework.routers import DefaultRouter
from api.views import ModuleViewSet

router = DefaultRouter()
router.register(r'', ModuleViewSet, basename='modules')
urlpatterns = router.urls