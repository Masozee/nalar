from django.urls import path, include

urlpatterns = [
    path('crm/', include('apps.admin_ops.crm.urls')),
    path('room-booking/', include('apps.admin_ops.room_booking.urls')),
    path('vehicle/', include('apps.admin_ops.vehicle_management.urls')),
    path('visitor/', include('apps.admin_ops.visitor_log.urls')),
]
