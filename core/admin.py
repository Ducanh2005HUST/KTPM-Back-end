from django.contrib import admin
from .models import Household, Person, TemporaryRecord, FeeType, Payment, ContributionCampaign

admin.site.register(Household)
admin.site.register(Person)
admin.site.register(TemporaryRecord)
admin.site.register(FeeType)
admin.site.register(Payment)
admin.site.register(ContributionCampaign)
