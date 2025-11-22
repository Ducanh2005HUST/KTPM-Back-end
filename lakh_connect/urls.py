from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # expose core views at the project root so URLs like `/` and `/home/` work
    # path('', include('core.urls')),
    # also keep the API under /api/
    path('api/', include('core.urls')),
]
