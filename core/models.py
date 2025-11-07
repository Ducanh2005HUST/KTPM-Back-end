from django.db import models
from django.utils import timezone

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
    relation_to_head = models.CharField(max_length=100, blank=True, null=True)
    id_number = models.CharField(max_length=30, blank=True, null=True)
    occupation = models.CharField(max_length=200, blank=True, null=True)
    is_head = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.full_name

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
