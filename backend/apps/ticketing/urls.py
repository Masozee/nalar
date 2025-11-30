from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    SLAPolicyViewSet,
    TicketViewSet,
    TicketCommentViewSet,
    TicketAttachmentViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'sla-policies', SLAPolicyViewSet)
router.register(r'tickets', TicketViewSet)
router.register(r'comments', TicketCommentViewSet)
router.register(r'attachments', TicketAttachmentViewSet)

urlpatterns = router.urls
