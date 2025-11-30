from django.urls import path, include

urlpatterns = [
    path('maintenance/', include('apps.assets.maintenance.urls')),
    path('assignment/', include('apps.assets.assignment.urls')),
]
