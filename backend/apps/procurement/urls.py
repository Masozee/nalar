from django.urls import path, include

urlpatterns = [
    path('vendor/', include('apps.procurement.vendor.urls')),
    path('po/', include('apps.procurement.purchase_order.urls')),
]
