# Bibliothèque Numérique (Microservices + DVC)

Projet d'examen \"Outils de Versioning\" (DIT) : plateforme de gestion de bibliothèque + recommandations + versioning avancé (Git + DVC) + Docker Compose + Jenkins.

## Structure du dépôt

- `services/` : microservices (actuellement : `livres/`)
- `infra/compose/` : docker-compose dev/prod
- `scripts/` : scripts utilitaires (seed, export, etc.)
- `ml/` : pipeline DVC (prétraitement, entraînement, évaluation)
- `docs/` : documentation (architecture, API, etc.)

## Prérequis

- Docker Desktop (avec `docker compose`)
- Python 3.x (pour les scripts)
- DVC (pour le pipeline ML)

## Lancement (dev)

1. Créer un fichier `.env` à la racine à partir de `.env.example`.
2. Démarrer la stack :

```bash
docker compose -f infra/compose/docker-compose.dev.yml up --build
```

Service Livres : `http://localhost:8001/`

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
- vérification Python (compile)
- build Docker Compose
- démarrage stack
- smoke test du service Livres

