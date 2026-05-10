# Plan frontend — étapes (sécurité, code propre, doc officielle)

Objectif : livrer l’UI exigée par l’énoncé (catalogue, emprunts, recommandations) **sans sur-ingénierie**, en s’appuyant sur la doc officielle et sur les **Karpathy guidelines** du dépôt (`.cursor/rules/karpathy-guidelines.mdc`).

## Principes transverses (chaque étape)

- **Critères de succès vérifiables** avant/après (build, linter, flux manuel, appel réseau réussi).
- **Changements chirurgicaux** uniquement dans le périmètre de l’étape.
- **Secrets** uniquement dans l’env (jamais dans le frontend).
- **Documentation** : en cas de doute, ouvrir la doc officielle (React, Vite, React Router, Tailwind, Radix/shadcn, puis TanStack Query si adopté).

---

## Phase 0 — Fondations

1. Inventaire des routes du template (landing vs dashboard).
2. Ajouter fichier **`.env.example`** côté Vite avec `VITE_API_LIVRES_URL` (puis autres services).
3. Définir la convention des chemins UX : **`/`** vitrine · **`/app/**`** étudiant · **`/dashboard/**`** admin (adapter au routeur existant du template sans tout casser).

**Vérification :** `pnpm dev` depuis `frontend/`, aucune erreur console au chargement.

---

## Phase 1 — Catalogue & API Livres

1. Module minimal `fetch` + types (ou Zod léger si déjà utilisé dans le projet) pour **`GET /books`**, recherche alignée avec le backend (**titre / auteur / ISBN** selon disponibilité réelle du service).
2. Page catalogue : grille ou table (réutiliser composants du template).

**Vérification :** avec uniquement **Livres** + DB up, les livres apparaissent sans CORS bloquant (sinon corriger avec l’agent backend : CORS FastAPI restrictif pour `http://localhost:5173` en dev).

**Sécurité :** pas de XSS volontaire ; pas de désactivation aveugle de protections.

Doc : **Fetch / React** données asynchrones, **OpenAPI FastAPI** du service Livres comme contrat si publié.

---

## Phase 2 — Emprunts (quand le service existe)

1. Écrans : emprunter, retourner, historique, badge **retard**.
2. États d’erreur métiers (409, 404) avec messages utilisateur clairs.

**Vérification :** scénario E2E manuel documenté dans le README (préconditions, étapes).

Doc : **HTTP semantics**, messages d’erreur API cohérents côté backend.

---

## Phase 3 — Recommandations

1. Appel **`GET /recommendations/{user_id}`** ; sélecteur d’utilisateur **provisoire** si l’auth n’est pas prête.
2. Page « Pour vous » accessible depuis l’espace étudiant.

**Vérification :** avec Reco up, la liste s’affiche ; sans Reco, message de service indisponible (graceful degradation).

Doc : **FastAPI** service Reco, contrat JSON stable.

---

## Phase 4 — Auth / rôles (minimal réaliste)

1. Définir si **auth réelle** (JWT/session) ou **sélection de rôle** pour démo.
2. Routes protégées (guard simple) sans refonte du template.

**Sécurité :** pas de JWT en query string ; préférer stockage/session selon implémentation choisie.

Doc : suivre uniquement les patterns officiels ou guide maintenu de la lib auth choisie.

---

## Phase 5 — Docker & Compose (obligation énoncé)

1. **Profil dev** : conteneur Vite avec hot reload (volume `./frontend/vite-version`).
2. **Profil prod** : multi-stage nginx pour assets statiques.
3. Mettre à jour le README avec la commande `docker compose -f infra/compose/docker-compose.yml` (voir profils Compose si dev/prod différenciés plus tard).

Doc : Docker multi-stage builds, Compose **profiles**.

---

## Phase 6 — Robustesse équipe senior

1. **Lint/format** comme dans `vite-version` (ne pas désactiver règles sans raison documentée).
2. Petits tests où le ratio effort/valeur est bon (hooks `fetch`, mappers données) si convenu par l’équipe — pas obligatoire pour la première passe si le périmètre temps est tendu ; privilégier alors **checks manuels** documentés et **erreurs utilisateur**.

Chaque livraison doit rester lisible dans `git diff` : une intention par PR.
