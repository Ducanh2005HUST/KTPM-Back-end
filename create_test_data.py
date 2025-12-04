#!/usr/bin/env python
import os
import sys
import django
from datetime import date, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lakh_connect.settings')
django.setup()

from core.models import Household, Person

def create_test_data():
    """Tạo dữ liệu test cho form đổi chủ hộ"""
    
    # Xóa dữ liệu cũ (nếu có)
    print("Đang xóa dữ liệu cũ...")
    Person.objects.all().delete()
    Household.objects.all().delete()
    
    # Tạo hộ khẩu 1
    print("Tạo hộ khẩu HK-001...")
    household1 = Household.objects.create(
        code="HK-001",
        head_name="Nguyễn Văn Nam",
        address="123 Đường Lê Lợi, Phường 1, Quận 1, TP.HCM"
    )
    
    # Tạo thành viên cho hộ khẩu 1
    # Chủ hộ
    Person.objects.create(
        household=household1,
        full_name="Nguyễn Văn Nam",
        dob=date(1975, 5, 15),
        gender="M",
        relation_to_head="Chủ hộ",
        id_number="025123456789",
        occupation="Kỹ sư",
        is_head=True
    )
    
    # Vợ
    Person.objects.create(
        household=household1,
        full_name="Trần Thị Mai",
        dob=date(1978, 8, 22),
        gender="F",
        relation_to_head="Vợ",
        id_number="025234567890",
        occupation="Giáo viên",
        is_head=False
    )
    
    # Con trai
    Person.objects.create(
        household=household1,
        full_name="Nguyễn Văn Long",
        dob=date(2000, 3, 10),
        gender="M",
        relation_to_head="Con trai",
        id_number="025345678901",
        occupation="Sinh viên",
        is_head=False
    )
    
    # Con gái
    Person.objects.create(
        household=household1,
        full_name="Nguyễn Thị Lan",
        dob=date(2005, 12, 5),
        gender="F",
        relation_to_head="Con gái",
        id_number="",
        occupation="Học sinh",
        is_head=False
    )
    
    # Tạo hộ khẩu 2
    print("Tạo hộ khẩu HK-002...")
    household2 = Household.objects.create(
        code="HK-002",
        head_name="Lê Văn Hùng",
        address="456 Đường Nguyễn Huệ, Phường 2, Quận 1, TP.HCM"
    )
    
    # Tạo thành viên cho hộ khẩu 2
    # Chủ hộ
    Person.objects.create(
        household=household2,
        full_name="Lê Văn Hùng",
        dob=date(1980, 1, 20),
        gender="M",
        relation_to_head="Chủ hộ",
        id_number="025456789012",
        occupation="Bác sĩ",
        is_head=True
    )
    
    # Mẹ
    Person.objects.create(
        household=household2,
        full_name="Phạm Thị Thu",
        dob=date(1955, 7, 8),
        gender="F",
        relation_to_head="Mẹ",
        id_number="025567890123",
        occupation="Hưu trí",
        is_head=False
    )
    
    # Em gái
    Person.objects.create(
        household=household2,
        full_name="Lê Thị Hoa",
        dob=date(1985, 11, 15),
        gender="F",
        relation_to_head="Em gái",
        id_number="025678901234",
        occupation="Kế toán",
        is_head=False
    )
    
    # Tạo hộ khẩu 3
    print("Tạo hộ khẩu HK-003...")
    household3 = Household.objects.create(
        code="HK-003",
        head_name="Trần Văn Dũng",
        address="789 Đường Trần Hưng Đạo, Phường 3, Quận 5, TP.HCM"
    )
    
    # Tạo thành viên cho hộ khẩu 3
    # Chủ hộ
    Person.objects.create(
        household=household3,
        full_name="Trần Văn Dũng",
        dob=date(1970, 4, 12),
        gender="M",
        relation_to_head="Chủ hộ",
        id_number="025789012345",
        occupation="Công nhân",
        is_head=True
    )
    
    # Vợ
    Person.objects.create(
        household=household3,
        full_name="Nguyễn Thị Hằng",
        dob=date(1973, 9, 28),
        gender="F",
        relation_to_head="Vợ",
        id_number="025890123456",
        occupation="Bán hàng",
        is_head=False
    )
    
    # Con trai 1
    Person.objects.create(
        household=household3,
        full_name="Trần Văn Minh",
        dob=date(1995, 6, 18),
        gender="M",
        relation_to_head="Con trai",
        id_number="025901234567",
        occupation="Lập trình viên",
        is_head=False
    )
    
    # Con trai 2
    Person.objects.create(
        household=household3,
        full_name="Trần Văn Tuấn",
        dob=date(1998, 2, 25),
        gender="M",
        relation_to_head="Con trai",
        id_number="025012345678",
        occupation="Nhân viên văn phòng",
        is_head=False
    )
    
    print("✅ Đã tạo xong dữ liệu test!")
    print("\nDanh sách hộ khẩu đã tạo:")
    
    for household in Household.objects.all():
        print(f"\n🏠 {household.code} - {household.head_name}")
        print(f"   📍 {household.address}")
        
        members = Person.objects.filter(household=household)
        for member in members:
            head_mark = " 👑" if member.is_head else ""
            print(f"   👤 {member.full_name} ({member.relation_to_head}){head_mark}")
            print(f"      📅 {member.dob} | {member.gender} | {member.occupation}")

if __name__ == "__main__":
    create_test_data()