from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models.functions import TruncMonth
from django.db.models import Sum
from .models import Household, Person, Payment
from .serializers import HouseholdSerializer, PersonSerializer, PaymentSerializer
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
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


from django.shortcuts import render
from django.db.models import Q
from .models import Household

from django.shortcuts import render
from django.db.models import Q
from .models import Household, Person

from django.shortcuts import render
from django.db.models import Q
from .models import Household


from django.shortcuts import render
from django.db.models import Q
from .models import Household, Person  # Person là model nhân khẩu

from django.shortcuts import render
from django.db.models import Q
from .models import Household, Person


def qlnk(request):
    # ===== 1. Lấy từ khóa tìm kiếm =====
    search_query_hk = request.GET.get('search_hk', '').strip()
    search_query_nk = request.GET.get('search_nk', '').strip()

    # ====================================
    # 2. TÌM KIẾM HỘ KHẨU
    # ====================================
    households = Household.objects.all()

    if search_query_hk:
        households = households.filter(
            Q(code__icontains=search_query_hk) |
            Q(head_name__icontains=search_query_hk) |
            Q(address__icontains=search_query_hk)
        )

    households = households.order_by('code')

    household_list = [
        {
            'id': h.id,
            'code': h.code,
            'head_name': h.head_name,
            'address': h.address,
            'person_count': h.members.count(),    # vì Person có FK household
        }
        for h in households
    ]

    # ====================================
    # 3. TÌM KIẾM NHÂN KHẨU
    # ====================================
    persons = Person.objects.select_related('household').all()

    if search_query_nk:
        persons = persons.filter(
            Q(full_name__icontains=search_query_nk) |
            Q(id_number__icontains=search_query_nk) |
            Q(dob__icontains=search_query_nk)
        )

    persons = persons.order_by('full_name')

    person_list = [
        {
            'id': p.id,
            'full_name': p.full_name,
            'dob': p.dob,
            'id_number': p.id_number,
            'gender': p.get_gender_display(),
            'household_code': p.household.code if p.household else '',
            'is_head': p.is_head,
            'relation_to_head': p.relation_to_head,
        }
        for p in persons
    ]

    # ====================================
    # 4. TRẢ DỮ LIỆU SANG TEMPLATE
    # ====================================
    context = {
        # Hộ khẩu
        'households': household_list,
        'household_count': len(household_list),
        'search_query_hk': search_query_hk,

        # Nhân khẩu
        'persons': person_list,
        'person_count': len(person_list),
        'search_query_nk': search_query_nk,
    }
    return render(request, 'qlnk.html', context)

def qltv_tt(request):

    return render(request, "qltv_tt.html")

def thuphi(request):

    return render(request, "thuphi.html")


def thongke_baocao(request):

    return render(request, "thongke_baocao.html")

def quanly_truycap(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")          # <-- Lấy email
        password = request.POST.get("password")
        is_staff = "is_staff" in request.POST

        # Kiểm tra username trùng
        if User.objects.filter(username=username).exists():
            messages.error(request, "Tên đăng nhập đã tồn tại!")
            return redirect("quanly_truycap")

        # Kiểm tra email trùng
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email đã được sử dụng!")
            return redirect("quanly_truycap")

        # Tạo user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.is_staff = is_staff
        user.save()

        messages.success(request, "Tạo tài khoản FULL QUYỀN thành công!")
        return redirect("quanly_truycap")

    return render(request, "quanly_truycap.html")


from django.db.models import Q


from django.shortcuts import render
from django.db.models import Q
from .models import Household

from django.shortcuts import render
from django.db.models import Q
from .models import Household

# views.py
from django.shortcuts import render
from .models import Household

from django.shortcuts import render
from .models import Household, Person
from django.db.models import Q

def sohokhau(request):
    """
    Trang Quản Lý Nhân Khẩu với search Hộ khẩu / Nhân khẩu
    """
    # Lấy query từ GET request
    search_hk = request.GET.get('searchHoKhau', '').strip()
    search_nk = request.GET.get('searchNhanKhau', '').strip()

    households = Household.objects.prefetch_related('members').all()

    # Search Hộ khẩu / Chủ hộ
    if search_hk:
        households = households.filter(
            Q(code__icontains=search_hk) |
            Q(head_name__icontains=search_hk) |
            Q(address__icontains=search_hk)
        )

    # Nếu search Nhân khẩu, lọc Household theo Person
    if search_nk:
        households = households.filter(
            members__full_name__icontains=search_nk
        ).distinct()

    # Tạo danh sách để truyền vào template
    household_list = []
    for h in households.order_by('code'):
        household_list.append({
            'id': h.id,
            'code': h.code,
            'head_name': h.head_name,
            'address': h.address,
            'person_count': h.members.count(),
        })

    context = {
        'households': household_list,
        'household_count': len(household_list),
    }
    return render(request, 'qlnk.html', context)

def nhankhau(request):

    return render(request, "nhankhau.html")

def themnk(request):
    return render(request, "themnk.html")

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib import messages

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Tìm user bằng email
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExxist:
            messages.error(request, "Email không tồn tại!")
            return render(request, 'login.html')

        # Authenticate bằng USERNAME (do Django không login bằng email)
        user = authenticate(request, username=user_obj.username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, "Mật khẩu không chính xác!")

    return render(request, 'login.html')


def taohokhau(request, household_id=None):
    """View cho trang tạo/cập nhật hộ khẩu"""

    if request.method == 'POST':
        try:
            # Parse JSON từ request
            data = json.loads(request.body)

            # Extract form data
            household_code = data.get('householdCode', '').strip()
            creation_date = data.get('creationDate')
            creation_reason = data.get('creationReason')

            # Address information
            house_number = data.get('houseNumber', '').strip()
            street_name = data.get('streetName', '').strip()
            ward_name = data.get('wardName')
            district_name = data.get('districtName')
            province_name = data.get('provinceName')
            full_address = data.get('fullAddress', '')

            # Head of household information
            head_full_name = data.get('headFullName', '').strip()
            head_alias = data.get('headAlias', '').strip()
            head_dob = data.get('headDob')
            head_gender = data.get('headGender')
            head_id_number = data.get('headIdNumber', '').strip()
            head_occupation = data.get('headOccupation', '').strip()
            head_ethnicity = data.get('headEthnicity', 'Kinh')
            head_religion = data.get('headReligion', '')
            head_education = data.get('headEducation', '')

            # Other information
            household_notes = data.get('householdNotes', '').strip()

            # Auto-generate household code if blank
            if not household_code:
                from datetime import datetime
                import random
                year = datetime.now().year
                random_num = random.randint(100, 999)
                household_code = f"HK-{year}{random_num}"

            # === EDIT MODE ===
            if household_id:
                try:
                    household = Household.objects.get(code=household_id)
                    household.code = household_code
                    household.head_name = head_full_name
                    household.address = full_address
                    household.save()

                    return JsonResponse({
                        'status': 'success',
                        'message': 'Cập nhật hộ khẩu thành công!',
                        'household_code': household_code
                    })
                except Household.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Không tìm thấy hộ khẩu cần cập nhật!'
                    })

            # === CREATE MODE ===
            else:
                if Household.objects.filter(code=household_code).exists():
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Mã hộ khẩu đã tồn tại!'
                    })

                # Create household
                household = Household.objects.create(
                    code=household_code,
                    head_name=head_full_name,
                    address=full_address,
                    created_at=creation_date
                )

                # Create head of household (Person)
                Person.objects.create(
                    household=household,
                    full_name=head_full_name,
                    alias=head_alias,
                    dob=head_dob,
                    gender=head_gender,
                    id_number=head_id_number,
                    occupation=head_occupation,

                    # NEW FIELDS (CHUẨN)
                    relation_to_head='Chủ hộ',
                    is_head=True
                )

                return JsonResponse({
                    'status': 'success',
                    'message': 'Tạo hộ khẩu thành công!',
                    'household_code': household_code
                })

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Dữ liệu không hợp lệ!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Có lỗi xảy ra: {str(e)}'})

    # === GET request ===
    context = {}
    if household_id:
        try:
            household = Household.objects.get(code=household_id)
            head_person = Person.objects.filter(household=household, is_head=True).first()

            context = {
                'is_edit': True,
                'household': household,
                'head_person': head_person
            }

        except Household.DoesNotExist:
            from django.contrib import messages
            messages.error(request, 'Không tìm thấy hộ khẩu!')
            return redirect('sohokhau')

    return render(request, 'taohokhau.html', context)


def biendong(request):
    """View cho trang cập nhật biến động nhân khẩu"""
    if request.method == 'POST':
        # Xử lý form submission
        try:
            # Lấy dữ liệu từ form
            nhankhau_id = request.POST.get('nhankhau_id')
            change_type = request.POST.get('change_type')
            
            # Xử lý theo loại biến động
            if change_type == 'chuyen_di':
                # Xử lý chuyển đi
                new_address = request.POST.get('new_address')
                move_date = request.POST.get('move_date')
                move_reason = request.POST.get('move_reason')
                move_note = request.POST.get('move_note', '')
                
                # Lưu vào database (implement later)
                # BiendongRecord.objects.create(...)
                
            elif change_type == 'qua_doi':
                # Xử lý qua đời
                death_date = request.POST.get('death_date')
                death_place = request.POST.get('death_place', '')
                death_cause = request.POST.get('death_cause')
                death_certificate = request.POST.get('death_certificate', '')
                death_note = request.POST.get('death_note', '')
                
                # Lưu vào database (implement later)
                
            elif change_type == 'doi_chu':
                # Xử lý đổi chủ hộ
                new_head = request.POST.get('new_head')
                change_date = request.POST.get('change_date')
                change_reason = request.POST.get('change_reason')
                approval_doc = request.POST.get('approval_doc', '')
                change_note = request.POST.get('change_note', '')
                
                # Lưu vào database (implement later)
            
            # Trả về JSON response cho AJAX
            return JsonResponse({
                'status': 'success',
                'message': 'Cập nhật biến động thành công!'
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Có lỗi xảy ra: {str(e)}'
            })
    
    # GET request - hiển thị form
    return render(request, 'biendong.html')
