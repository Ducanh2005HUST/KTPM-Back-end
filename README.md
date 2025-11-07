LaKhe Connect - Django backend skeleton (SQLite)
------------------------------------------------
This is a minimal Django project skeleton prepared for you, using SQLite for local development.

Structure:
- Django project: lakh_connect
- App: core (models, admin, serializers, views, urls)
- requirements.txt, Dockerfile, docker-compose.yml, .env.example, README.md

Quick start (local, without Docker):
1. Create virtualenv and activate it:
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
2. Install dependencies:
   pip install -r requirements.txt
3. Run migrations and create superuser:
   python manage.py migrate
   python manage.py createsuperuser
4. Run server:
   python manage.py runserver

Notes:
- This skeleton uses SQLite by default. To use PostgreSQL/Neon later, set DATABASE_URL and update settings.
- Adjust SECRET_KEY and DEBUG in production.
