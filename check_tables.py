#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lakh_connect.settings')
django.setup()

from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
tables = [row[0] for row in cursor.fetchall()]
print("Tables in database:")
for table in tables:
    print(f"  {table}")