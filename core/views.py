from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models.functions import TruncMonth
from django.db.models import Sum
from .models import Household, Person, Payment
from .serializers import HouseholdSerializer, PersonSerializer, PaymentSerializer
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json

class HouseholdViewSet(viewsets.ModelViewSet):
    queryset = Household.objects.all().order_by('code')
    serializer_class = HouseholdSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['code','head_name','address']

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.select_related('household').all()
    serializer_class = PersonSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name','id_number']

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer

    @action(detail=False, methods=['get'])
    def summary_by_month(self, request):
        qs = Payment.objects.filter(status='PAID').annotate(month=TruncMonth('created_at')).values('month').annotate(total=Sum('amount')).order_by('month')
        return Response(list(qs))

def home(request):
    return render(request, "home.html")


def qlnk(request):
    return render(request, "qlnk.html")


def qltv_tt(request):
    return render(request, "qltv_tt.html")


def thuphi(request):
    return render(request, "thuphi.html")


def thongke_baocao(request):
    return render(request, "thongke_baocao.html")

def quanly_truycap(request):
    return render(request, "quanly_truycap.html")

def sohokhau(request):
    return render(request, "sohokhau.html")

def nhankhau(request):
    return render(request, "nhankhau.html")

def themnk(request):
    return render(request, "themnk.html")
