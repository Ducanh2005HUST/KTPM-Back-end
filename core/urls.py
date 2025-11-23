from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'households', views.HouseholdViewSet)
router.register(r'persons', views.PersonViewSet)
router.register(r'payments', views.PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("home/", views.home, name="home"),
    path("qlnk/", views.qlnk, name="qlnk"),
    path("qltv_tt/", views.qltv_tt, name="qltv_tt"),
    path("thuphi/", views.thuphi, name="thuphi"),
    path("thongke_baocao/", views.thongke_baocao, name="thongke_baocao"),
    path("quanlytruycap/", views.quanly_truycap, name="quanly_truycap"),
    path("sohokhau/", views.sohokhau, name="sohokhau"),
    path("nhankhau/", views.nhankhau, name="nhankhau"),
    path("themnk/", views.themnk, name="themnk"),
    path("login/", views.login_view, name="login"),
]
