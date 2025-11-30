from rest_framework.routers import DefaultRouter
from .views import (
    WorkflowTemplateViewSet,
    WorkflowStepViewSet,
    ApprovalRequestViewSet,
    ApprovalDelegateViewSet,
)

router = DefaultRouter()
router.register('templates', WorkflowTemplateViewSet, basename='workflow-template')
router.register('steps', WorkflowStepViewSet, basename='workflow-step')
router.register('requests', ApprovalRequestViewSet, basename='approval-request')
router.register('delegates', ApprovalDelegateViewSet, basename='approval-delegate')

urlpatterns = router.urls
