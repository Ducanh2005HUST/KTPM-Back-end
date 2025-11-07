from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'households', views.HouseholdViewSet)
router.register(r'persons', views.PersonViewSet)
router.register(r'payments', views.PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
