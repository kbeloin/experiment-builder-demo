from rest_framework.routers import DefaultRouter
from api.views import ExperimentViewSet


router = DefaultRouter()
router.register(r'', ExperimentViewSet, basename='experiments')
urlpatterns = router.urls