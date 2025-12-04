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

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember_me')
        
        # Simple authentication (you can integrate with Django auth later)
        if username == 'admin' and password == 'admin123':
            # Set session or redirect to dashboard
            request.session['user_logged_in'] = True
            request.session['username'] = username
            
            if not remember_me:
                request.session.set_expiry(0)  # Session expires when browser closes
            
            return redirect('home')
        else:
            from django.contrib import messages
            messages.error(request, 'Tên đăng nhập hoặc mật khẩu không chính xác!')
    
    return render(request, 'login.html')

def taohokhau(request, household_id=None):
    """View cho trang tạo/cập nhật hộ khẩu"""
    if request.method == 'POST':
        try:
            # Lấy dữ liệu từ form JSON
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
            
            # Additional information
            household_notes = data.get('householdNotes', '').strip()
            
            # Generate household code if not provided
            if not household_code:
                from datetime import datetime
                import random
                year = datetime.now().year
                random_num = random.randint(100, 999)
                household_code = f"HK-{year}{random_num}"
            
            # Check if updating existing household
            if household_id:
                try:
                    household = Household.objects.get(code=household_id)
                    # Update existing household
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
            else:
                # Check if household code already exists
                if Household.objects.filter(code=household_code).exists():
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Mã hộ khẩu đã tồn tại!'
                    })
                
                # Create new household
                household = Household.objects.create(
                    code=household_code,
                    head_name=head_full_name,
                    address=full_address,
                    created_at=creation_date
                )
                
                # Create head of household as first person
                Person.objects.create(
                    household=household,
                    full_name=head_full_name,
                    alias=head_alias,
                    dob=head_dob,
                    gender=head_gender,
                    id_number=head_id_number,
                    occupation=head_occupation,
                    relation_to_head='Chủ hộ',
                    is_head=True
                )
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Tạo hộ khẩu thành công!',
                    'household_code': household_code
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Dữ liệu không hợp lệ!'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Có lỗi xảy ra: {str(e)}'
            })
    
    # GET request - display form
    context = {}
    if household_id:
        try:
            household = Household.objects.get(code=household_id)
            # Get head of household info
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

def formdoichuho(request):
    """View cho form đổi chủ hộ"""
    if request.method == 'POST':
        try:
            # Lấy dữ liệu từ form JSON
            data = json.loads(request.body)
            
            household_code = data.get('householdCode')
            new_head_id = data.get('newHeadId')
            change_date = data.get('changeDate')
            change_reason = data.get('changeReason')
            performed_by = data.get('performedBy')
            approval_document = data.get('approvalDocument', '')
            notes = data.get('notes', '')
            
            # Validation
            if not all([household_code, new_head_id, change_date, change_reason, performed_by]):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Vui lòng điền đầy đủ thông tin bắt buộc!'
                })
            
            # Get household and persons
            try:
                household = Household.objects.get(code=household_code)
                new_head_person = Person.objects.get(id=new_head_id, household=household)
                current_head = Person.objects.filter(household=household, is_head=True).first()
                
                # Check if new head is eligible (18+ years old)
                from datetime import date
                if new_head_person.dob:
                    today = date.today()
                    age = today.year - new_head_person.dob.year
                    if today.month < new_head_person.dob.month or (today.month == new_head_person.dob.month and today.day < new_head_person.dob.day):
                        age -= 1
                    if age < 18:
                        return JsonResponse({
                            'status': 'error',
                            'message': 'Thành viên được chọn chưa đủ 18 tuổi!'
                        })
                
                # Update household head
                if current_head:
                    current_head.is_head = False
                    current_head.relation_to_head = 'Thành viên' if current_head.relation_to_head == 'Chủ hộ' else current_head.relation_to_head
                    current_head.save()
                
                # Set new head
                new_head_person.is_head = True
                new_head_person.relation_to_head = 'Chủ hộ'
                new_head_person.save()
                
                # Update household
                household.head_name = new_head_person.full_name
                household.save()
                
                # TODO: Create change record for history tracking
                
                return JsonResponse({
                    'status': 'success',
                    'message': f'Đã thay đổi chủ hộ {household_code} thành công!',
                    'new_head_name': new_head_person.full_name
                })
                
            except Household.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Không tìm thấy hộ khẩu!'
                })
            except Person.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Không tìm thấy thành viên được chọn!'
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Dữ liệu không hợp lệ!'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Có lỗi xảy ra: {str(e)}'
            })
    
    # GET request - display form
    return render(request, 'formdoichuho.html')

@csrf_exempt
def get_household_members(request, household_code):
    """API endpoint để lấy danh sách thành viên của hộ khẩu"""
    try:
        household = Household.objects.get(code=household_code)
        members = Person.objects.filter(household=household)
        
        members_data = []
        for member in members:
            members_data.append({
                'id': member.id,
                'full_name': member.full_name,
                'dob': member.dob.strftime('%Y-%m-%d') if member.dob else None,
                'gender': member.gender,
                'relation_to_head': member.relation_to_head,
                'id_number': member.id_number,
                'occupation': member.occupation,
                'is_head': member.is_head
            })
        
        return JsonResponse({
            'status': 'success',
            'results': members_data
        })
        
    except Household.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Không tìm thấy hộ khẩu!'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Có lỗi xảy ra: {str(e)}'
        })
