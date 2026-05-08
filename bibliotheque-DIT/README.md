# 📚 Bibliothèque Numérique — DIT

Plateforme complète de gestion de bibliothèque académique avec système de recommandation.

## 🏗️ Architecture

| Service         | Technologie      | Port |
|-----------------|------------------|------|
| Frontend        | HTML/CSS/JS+Nginx| 80   |
| Livres          | Django REST      | 8001 |
| Utilisateurs    | Django REST      | 8002 |
| Emprunts        | Django REST      | 8003 |
| Recommandation  | FastAPI + SVD    | 8004 |
| Base de données | PostgreSQL 15    | 5432 |

## 🚀 Lancement rapide

```bash
# 1. Cloner et configurer
git clone <repo-url>
cd bibliotheque-DIT
cp .env.example .env

# 2. Lancer tous les services
docker compose --profile dev up --build

# 3. Accéder à l'application
# Frontend  → http://localhost
# API Docs  → http://localhost:8004/docs
```

## 🗄️ Base de données

Les bases sont créées automatiquement via `scripts/init_db.sql`.
Pour ajouter des données de test :

```bash
docker exec -it biblio_livres python manage.py shell
# puis créer des objets via l'ORM Django
```

## 🤖 Pipeline DVC

```bash
# Installer DVC
pip install dvc dvc-gdrive

# Initialiser
git init && dvc init

# Configurer le remote Google Drive
dvc remote add -d myremote gdrive://<FOLDER_ID>

# Exporter les données depuis le service Emprunts
curl http://localhost:8003/api/emprunts/export_csv/ -o dvc_pipeline/data/loans.csv
dvc add dvc_pipeline/data/loans.csv
git add dvc_pipeline/data/loans.csv.dvc .gitignore
git commit -m "feat: add loans dataset"

# Lancer le pipeline complet
dvc repro

# Voir les métriques
dvc metrics show

# Comparer deux versions
dvc metrics diff HEAD~1

# Pousser données et modèle vers Google Drive
dvc push
```

## 📡 Endpoints principaux

### Livres (http://localhost:8001)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/livres/ | Liste tous les livres |
| POST | /api/livres/ | Ajouter un livre |
| GET | /api/livres/{id}/ | Détail d'un livre |
| PUT | /api/livres/{id}/ | Modifier un livre |
| DELETE | /api/livres/{id}/ | Supprimer un livre |
| GET | /api/livres/search/?q= | Recherche |
| GET | /api/livres/disponibles/ | Livres disponibles |
| GET | /api/livres/stats/ | Statistiques |

### Utilisateurs (http://localhost:8002)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/utilisateurs/ | Liste des utilisateurs |
| POST | /api/utilisateurs/ | Créer un utilisateur |
| GET | /api/utilisateurs/{id}/profil_complet/ | Profil complet |
| GET | /api/utilisateurs/par_type/ | Grouper par type |
| POST | /api/utilisateurs/{id}/activer/ | Activer compte |
| GET | /api/utilisateurs/stats/ | Statistiques |

### Emprunts (http://localhost:8003)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/emprunts/ | Historique complet |
| POST | /api/emprunts/emprunter/ | Emprunter un livre |
| POST | /api/emprunts/{id}/retourner/ | Retourner un livre |
| GET | /api/emprunts/en_retard/ | Retards |
| GET | /api/emprunts/export_csv/ | Export pour ML |
| GET | /api/emprunts/stats/ | Statistiques |

### Recommandation (http://localhost:8004)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /recommendations/{user_id} | Recommandations |
| POST | /train | Ré-entraîner le modèle |
| GET | /model/info | Info modèle |
| GET | /docs | Documentation Swagger |

## 🔧 Git — Workflow recommandé

```bash
# Branches
git checkout -b feature/service-livres
git checkout -b feature/service-emprunts
git checkout -b feature/dvc-pipeline

# Commits conventionnels
git commit -m "feat: add book recommendation endpoint"
git commit -m "fix: loan status update on return"
git commit -m "docs: update README with DVC instructions"

# Merge via Pull Request
git checkout main
git merge --no-ff feature/service-livres
git tag -a v1.0.0 -m "Version initiale"
```

## 📦 Structure du projet
```
bibliotheque-DIT/
├── docker-compose.yml
├── dvc.yaml
├── .gitignore
├── services/
│   ├── livres/          # Django REST :8001
│   ├── utilisateurs/    # Django REST :8002
│   ├── emprunts/        # Django REST :8003
│   ├── recommandation/  # FastAPI     :8004
│   └── frontend/        # HTML/CSS/JS :80
├── dvc_pipeline/
│   ├── preprocess.py
│   ├── train.py
│   ├── evaluate.py
│   ├── params.yaml
│   └── data/  models/
└── scripts/
    └── init_db.sql
```
