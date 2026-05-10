# Plan fonctionnel — services Bibliothèque numérique (examen)

Document de rattachement **Examen\_Outils\_Vers** : périmètre métier tel que demandé pour les microservices FastAPI associés au frontend Vite dans `frontend/vite-version`.

## Règle d’accès (UI démo)

- **Catalogue (livres)** : visible **sans compte**, lecture seule depuis l’API Livres (`GET /books`).
- **Emprunts et recommandations** : après **session lecteur locale** ayant été remplie par `POST /utilisateurs/login` (ou inscription `POST /utilisateurs`).
- **Espace Personnel (admin UI)** : rôle **`personnel`** uniquement (garde côté interface sur le rôle stocké en session après login). Gestion du fonds (`CRUD` livres) et liste des utilisateurs.

Ce modèle reste démonstratif (pas de JWT ni contrôle centralisé fort des listes utilisateurs).

## Livres (`services/livres`, port Compose 8001)

| Fonction | Détail |
|----------|--------|
| Lister | `GET /books` pagination `page`, `page_size`. |
| Rechercher | Paramètre `q` sur **titre, auteur, catégorie, ISBN**. |
| Ajouter | `POST /books` (corps JSON : titre, auteur, catégorie, isbn). |
| Modifier | `PUT /books/{id}` |
| Supprimer | `DELETE /books/{id}` |
| Champ ISBN | Colonne PostgreSQL avec migration au démarrage (`ALTER … IF NOT EXISTS`). |

## Utilisateurs (`services/utilisateurs`, port 8004)

| Fonction | Détail |
|----------|--------|
| Création | `POST /utilisateurs` (mot de passe haché **bcrypt**). |
| Liste | `GET /utilisateurs` (liste complète dans l’état démo du backend ; **l’UX ne l’expose qu’aux comptes personnel**). |
| Types | Énumération : `etudiant`, `professeur`, `personnel`. |
| Consultation profil | `GET /utilisateurs/{id}` utilisé depuis la page **Profil** quand une session avec `id` est présente. |
| Connexion | `POST /utilisateurs/login` — vérif bcrypt, réponse sans mot de passe. |

## Seed comptes de démo

Trois comptes insérés **si la table est vide** au démarrage du service (voir README racine), mot de passe identique documenté :

- **Personnel / admin biblio** : `admin.bibliotheque@univ.local`
- **Professeur** : `prof.ml@univ.local`
- **Étudiant** : `etudiant.demo@univ.local`

## Frontend Vite (`frontend/vite-version`)

| Route | Usage |
|-------|------|
| `/` | Catalogue public. |
| `/emprunts`, `/recommandations`, `/profil` | Session lecteur obligatoire. |
| `/personnel` (+ alias `/admin`) | Session + rôle personnel. |
| `/auth/sign-in`, `/auth/sign-up` | Login API / inscription étudiant ou professeur. |

Voir aussi `README.md` (racine) pour les URLs des services et le mot de passe de démo.
