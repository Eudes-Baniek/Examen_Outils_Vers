# 📚 Bibliothèque Numérique --- DIT

Projet de microservices pour la gestion d'une bibliothèque académique
avec système de recommandation intelligent.

------------------------------------------------------------------------

# 🏗️ Architecture globale

## Services

  Service           Technologie           Port
  ----------------- --------------------- ------
  Frontend          HTML/CSS/JS + Nginx   80
  Livres            Django REST           8001
  Utilisateurs      Django REST           8002
  Emprunts          Django REST           8003
  Recommandation    FastAPI + ML          8004
  Base de données   PostgreSQL 15         5432
  PgAdmin           Administration DB     5050

------------------------------------------------------------------------

# 🚀 Lancement du projet

## Build et run

docker compose up --build

## Rebuild complet (si erreur)

docker compose down -v docker compose up --build

------------------------------------------------------------------------

# 🗄️ Base de données

-   Nom : bibliotheque
-   Host : db
-   Port : 5432
-   User : admin
-   Password : admin123

Tous les services utilisent cette base unique.

------------------------------------------------------------------------

# ⚙️ Configuration Django

DATABASES = { 'default': { 'ENGINE': 'django.db.backends.postgresql',
'NAME': 'bibliotheque', 'USER': 'admin', 'PASSWORD': 'admin123', 'HOST':
'db', 'PORT': 5432, } }

ALLOWED_HOSTS = \['\*'\]

------------------------------------------------------------------------

# 🧱 Migrations Django

docker compose exec livres python manage.py makemigrations docker
compose exec utilisateurs python manage.py makemigrations docker compose
exec emprunts python manage.py makemigrations

docker compose exec livres python manage.py migrate docker compose exec
utilisateurs python manage.py migrate docker compose exec emprunts
python manage.py migrate

------------------------------------------------------------------------

# 📡 API Endpoints

Livres (8001) GET /api/livres/ POST /api/livres/ GET /api/livres/{id}/
PUT /api/livres/{id}/ DELETE /api/livres/{id}/

Utilisateurs (8002) GET /api/utilisateurs/ POST /api/utilisateurs/ GET
/api/utilisateurs/{id}/

Emprunts (8003) POST /api/emprunts/emprunter/ POST
/api/emprunts/retourner/ GET /api/emprunts/

Recommandation (8004) GET /recommendations/{user_id} POST /train

------------------------------------------------------------------------

# 🧰 PgAdmin

http://localhost:5050

------------------------------------------------------------------------

# ⚠️ Important

-   Une seule base PostgreSQL
-   migrations obligatoires
-   docker restart après modification models

------------------------------------------------------------------------

# 🚀 Commandes

docker compose up --build docker compose down -v docker compose logs -f
