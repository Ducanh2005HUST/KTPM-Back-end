FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
ENV PYTHONUNBUFFERED=1
CMD ["gunicorn", "lakh_connect.wsgi:application", "--bind", "0.0.0.0:8000"]
