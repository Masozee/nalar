from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)

# Add more routers as apps are developed
# router.register(r'departments', DepartmentViewSet)
# router.register(r'teams', TeamViewSet)
