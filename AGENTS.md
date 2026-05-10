# Agents Cursor (équipe Bibliothèque numérique)

Les instructions détaillées pour accompagner Cursor sur ce dépôt sont dans **`.cursor/rules/`**.

> **Note :** `.cursor/` est ignoré par Git dans ce projet (configuration locale uniquement).
> Pour partager avec l’équipe : copier les fichiers `.mdc` hors du dépôt ou retirer temporairement l’entrée `.cursor/` du `.gitignore` si vous décidez de versionner ces règles.

## Fichiers principaux

| Fichier | Rôle |
|--------|------|
| [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) | Comportement de base (**alwaysApply**) pour tout développement. |
| [`.cursor/rules/agent-frontend.mdc`](.cursor/rules/agent-frontend.mdc) | Contexte lorsque vous éditez des composants **`frontend/vite-version/**/*.tsx`**. |
| [`.cursor/rules/agent-frontend-ts.mdc`](.cursor/rules/agent-frontend-ts.mdc) | Clients API, hooks, utilitaires **`frontend/vite-version/**/*.ts`**. |
| [`.cursor/rules/agent-backend.mdc`](.cursor/rules/agent-backend.mdc) | Microservices **`services/**/*.py`**. |
| [`.cursor/rules/agent-backend-scripts.mdc`](.cursor/rules/agent-backend-scripts.mdc) | Scripts **`scripts/**/*.py`**. |
| [`.cursor/rules/agent-backend-ml.mdc`](.cursor/rules/agent-backend-ml.mdc) | Code ML **`ml/**/*.py`**. |
| [`.cursor/rules/agent-backend-dvc.mdc`](.cursor/rules/agent-backend-dvc.mdc) | **`ml/**/*.yaml`** (pipeline DVC). |
| [`.cursor/rules/agent-backend-infra.mdc`](.cursor/rules/agent-backend-infra.mdc) | **Docker Compose** sous **`infra/**/*.yml`**. |
| [`.cursor/rules/agent-devops.mdc`](.cursor/rules/agent-devops.mdc) | **`Jenkinsfile`** (pipeline CI/CD). |
| [`.cursor/rules/agent-devops-gha.mdc`](.cursor/rules/agent-devops-gha.mdc) | **`/.github/**/*.yml`** (workflows GitHub Actions si présents). |

En session Cursor, lorsque vous ouvrez des fichiers correspondant aux `globs`, les règles « agent » s’ajoutent aux **Karpathy guidelines**.

## Plan frontend par étapes (versionné)

Voir [`docs/plan-frontend-etapes.md`](docs/plan-frontend-etapes.md).
