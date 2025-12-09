from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Household(models.Model):
    code = models.CharField(max_length=20, unique=True)
    head_name = models.CharField(max_length=200)
    address = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.code} — {self.head_name}"

class Person(models.Model):
    GENDER_CHOICES = [('M','Nam'),('F','Nữ'),('O','Khác')]

    household = models.ForeignKey(Household, related_name='members', on_delete=models.CASCADE)

    full_name = models.CharField(max_length=200)
    alias = models.CharField(max_length=100, blank=True, null=True)
    dob = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    # === Bạn yêu cầu thêm 2 field này ===
    relation_to_head = models.CharField(max_length=100, blank=True, null=True)
    is_head = models.BooleanField(default=False)
    # ==================================

    id_number = models.CharField(max_length=30, blank=True, null=True)
    occupation = models.CharField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name

class TemporaryRecord(models.Model):
    REC_TYPE = [('TEMP_OUT','Tạm vắng'),('TEMP_IN','Tạm trú')]
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='temp_records')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='temp_records', null=True, blank=True)
    rec_type = models.CharField(max_length=10, choices=REC_TYPE)
    from_date = models.DateField()
    to_date = models.DateField(null=True, blank=True)
    destination = models.CharField(max_length=300, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class FeeType(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    amount_per_person = models.IntegerField(default=0)
    periodicity = models.CharField(max_length=50, default='monthly')
    def __str__(self): return self.name

class ContributionCampaign(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

class Payment(models.Model):
    PAYMENT_STATUS = [('PAID','Đã thu'),('PENDING','Chưa thu')]
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='payments')
    fee_type = models.ForeignKey(FeeType, on_delete=models.SET_NULL, null=True, blank=True)
    campaign = models.ForeignKey(ContributionCampaign, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.BigIntegerField()
    month = models.DateField(null=True, blank=True)
    collected_by = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.household.code} - {self.amount}"
class UserRole(models.Model):
    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("TO_TRUONG", "Tổ trưởng"),
        ("TO_PHO", "Tổ phó"),
        ("CAN_BO", "Cán bộ"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="role")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ============================
# AUTO ASSIGN ROLE BY EMAIL
# ============================

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

def get_role_from_email(email: str):
    if not email:
        return "CAN_BO"

    email = email.lower().strip()

    if email.endswith("@admin.com"):
        return "ADMIN"

    if email.endswith("@totruong.com"):
        return "TO_TRUONG"

    if email.endswith("@topho.com"):
        return "TO_PHO"

    if email.endswith("@canbo.com"):
        return "CAN_BO"

    return "CAN_BO"


@receiver(post_save, sender=User)
def auto_assign_role(sender, instance, created, **kwargs):
    if created:
        # Lấy model UserRole từ registry, tránh circular import
        UserRole = instance._meta.apps.get_model('core', 'UserRole')

        UserRole.objects.create(
            user=instance,
            role=get_role_from_email(instance.email)
        )
