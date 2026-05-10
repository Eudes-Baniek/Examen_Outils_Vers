# Bibliothèque Numérique (Microservices + DVC)

Projet d'examen \"Outils de Versioning\" (DIT) : plateforme de gestion de bibliothèque + recommandations + versioning avancé (Git + DVC) + Docker Compose + Jenkins.

## Structure du dépôt

- `frontend/` : interface (template Vite + workspace pnpm ; voir `frontend/vite-version`)
- `AGENTS.md` : cartographie des agents Cursor frontend/backend (règles locales dans `.cursor/rules/`)
- `docs/plan-frontend-etapes.md` : plan par phases (sécurité, doc officielle)
- `docs/plan-services-biblio.md` : fonctionnalités métier Livres / Utilisateurs / règles d’accès catalogue et emprunt
- `services/` : microservices **Livres**, **Emprunts**, **Reco**, **Utilisateurs** (FastAPI + PostgreSQL)
- `infra/compose/` : `docker-compose.yml` (PostgreSQL + microservices)
- `scripts/` : scripts utilitaires (seed, export, etc.)
- `ml/` : pipeline DVC (prétraitement, entraînement, évaluation)
- `docs/` : documentation (architecture, API, etc.)

## Prérequis

- Docker Desktop (avec `docker compose`)
- Python 3.x (pour les scripts)
- Node.js / pnpm (pour le frontend)
- DVC (pour le pipeline ML)

### Frontend (dev local)

Depuis la racine du dossier `frontend/` :

```bash
pnpm install
pnpm dev
```

## Lancement (Docker Compose)

1. Créer **`infra/compose/.env`** (copie de **`infra/compose/.env.example`**) avec Postgres : `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

2. **Important — répertoire courant** : les chemins `build: ../../services/...` du compose sont pensés pour une exécution **depuis la racine du dépôt** (`Examen_Outils_Vers`).
   - Correct : `docker compose -f infra/compose/docker-compose.yml up --build`
   - Incorrect : après `cd infra`, ne pas utiliser `infra/compose/...` ; à la place : `cd compose` puis `docker compose -f docker-compose.yml up --build`

3. (Recommandé) Renseigner la base avec des livres, pour que les services **emprunts** et **reco** puissent peupler / lire le fonds :

```bash
python scripts/seed_db.py
```

**Ports (hôte)**

| Service           | URL                     |
|-------------------|-------------------------|
| Livres            | `http://localhost:8001` |
| Emprunts          | `http://localhost:8002` |
| Recommandations   | `http://localhost:8003` |
| Utilisateurs      | `http://localhost:8004` |

### Comptes de démo (service Utilisateurs)

Au premier démarrage, si la base ne contient encore aucun utilisateur, trois comptes sont créés avec le même mot de passe **bcrypt** :

| Profil              | Adresse e-mail                  | Rôle FastAPI (`role`) |
|---------------------|---------------------------------|-------------------------|
| Administratif biblio | `admin.bibliotheque@univ.local` | `personnel` (admin UI) |
| Professeur          | `prof.ml@univ.local`            | `professeur`           |
| Étudiant            | `etudiant.demo@univ.local`      | `etudiant`             |

Mot de passe (démonstration uniquement) : **`demo123!`**.

Le frontend Vite doit appeler au minimum `POST /utilisateurs/login` (variable `VITE_API_UTILISATEURS_URL`). Le catalogue reste lisible sans session ; les emprunts et recommandations exigent cette session locale.

**CORS** : les APIs autorisent par défaut plusieurs origines locales Vite dont `http://localhost:5174`. Si votre dev server utilise un autre port et que vous voyez un `OPTIONS ... 400` au login, ajoutez `CORS_ALLOW_ORIGINS` (liste séparée par des virgules) dans votre environnement de conteneurs ou reconstruire les images après mise à jour du code.

Pour des livres d’exemple avec **ISBN**, utiliser depuis l’hôte :

```bash
python scripts/seed_db.py
```

(dépend d’une base joignable avec une table `livres` contenant une colonne `isbn`.)

## Scripts utiles

- Seed livres (depuis la machine hôte) :

```bash
python scripts/seed_db.py
```

- Export livres JSON (script actuel) :

```bash
python scripts/export_data.py
```

## DVC (squelette)

Le pipeline DVC est défini dans `ml/dvc.yaml` avec 3 étapes :
- `preprocess` → `data/loans_clean.csv`
- `train` → `models/model.pkl`
- `evaluate` → `metrics/metrics.json`

Exécution (après avoir ajouté `ml/data/loans.csv`) :

```bash
cd ml
dvc repro
```

## Jenkins

Le `Jenkinsfile` fournit une pipeline de base :
- vérification Python (compile des `main.py` Livres / Emprunts / Reco / Utilisateurs)
- build Docker Compose
- démarrage stack
- smoke tests sur les services HTTP Livres / Emprunts / Reco / Utilisateurs (ports 8001–8004)

