from django.urls import path, include

urlpatterns = [
    path('sku/', include('apps.inventory.sku.urls')),
    path('opname/', include('apps.inventory.stock_opname.urls')),
    path('transfer/', include('apps.inventory.stock_transfer.urls')),
]
