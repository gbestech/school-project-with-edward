# FROM python:3.11-slim

# ENV PYTHONDONTWRITEBYTECODE=1
# ENV PYTHONUNBUFFERED=1

# WORKDIR /app

# COPY requirements.txt .
# RUN pip install --upgrade pip && pip install -r requirements.txt

# COPY . .

# EXPOSE 8000

# CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]


# FROM python:3.11-slim

# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1

# WORKDIR /app

# # Install dependencies
# COPY requirements.txt .
# RUN pip install --upgrade pip && pip install -r requirements.txt

# # Copy project
# COPY . .

# # Collect static files for production
# RUN python manage.py collectstatic --noinput

# # Expose app port
# EXPOSE 8000

# # Healthcheck
# HEALTHCHECK CMD curl --fail http://localhost:8000/health || exit 1

# # Start Gunicorn server
# CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers=4", "--threads=2", "--timeout=120"]


FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . .

# Set dummy SECRET_KEY for collectstatic build step
ENV SECRET_KEY="dummy-secret-key-for-build-only"

# Collect static files for production
RUN python manage.py collectstatic --noinput

# Expose app port
EXPOSE 8000

# Healthcheck
HEALTHCHECK CMD curl --fail http://localhost:8000/health || exit 1

# Start Gunicorn server
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers=4", "--threads=2", "--timeout=120"]