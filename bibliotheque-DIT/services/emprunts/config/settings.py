import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-emprunts-key-2024')

DEBUG = os.environ.get('DEBUG', '1') == '1'

ALLOWED_HOSTS = ['*']


# ─────────────────────────────
# APPS
# ─────────────────────────────
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',

    # Django REST Framework (UNE SEULE FOIS)
    'rest_framework',

    # Extensions
    'corsheaders',
    'django_filters',

    # App métier
    'emprunts_app',
]


# ─────────────────────────────
# MIDDLEWARE
# ─────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'config.urls'

CORS_ALLOW_ALL_ORIGINS = True


# ─────────────────────────────
# DATABASE
# ─────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'bibliotheque',
        'USER': 'admin',
        'PASSWORD': 'admin123',
        'HOST': 'db',
        'PORT': 5432,
    }
}


# ─────────────────────────────
# REST FRAMEWORK
# ─────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend'
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}


# ─────────────────────────────
# MICRO-SERVICES URLs
# ─────────────────────────────
LIVRES_SERVICE_URL = os.environ.get(
    'LIVRES_SERVICE_URL',
    'http://livres:8001'
)

USERS_SERVICE_URL = os.environ.get(
    'USERS_SERVICE_URL',
    'http://utilisateurs:8002'
)


# ─────────────────────────────
# BUSINESS SETTINGS
# ─────────────────────────────
DUREE_EMPRUNT_DEFAULT = 14


# ─────────────────────────────
# INTERNATIONALIZATION
# ─────────────────────────────
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Dakar'

USE_I18N = True
USE_TZ = True


# ─────────────────────────────
# DEFAULT AUTO FIELD
# ─────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'