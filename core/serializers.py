from rest_framework import serializers
from .models import Household, Person, TemporaryRecord, FeeType, Payment, ContributionCampaign

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

class HouseholdSerializer(serializers.ModelSerializer):
    members = PersonSerializer(many=True, read_only=True)
    class Meta:
        model = Household
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
