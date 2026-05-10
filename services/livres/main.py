from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
import os
import time
from contextlib import asynccontextmanager

# --- MODÈLE DE DONNÉES ---


class Book(BaseModel):
    id: Optional[int] = None
    titre: str
    auteur: str
    categorie: Optional[str] = ""
    isbn: Optional[str] = ""


class PaginatedBooks(BaseModel):
    items: List[Book]
    total: int
    page: int
    page_size: int


# --- CONFIGURATION BASE DE DONNÉES ---
DB_HOST = os.getenv("POSTGRES_HOST", os.getenv("DB_HOST", "db"))
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")


def get_db_connection():
    """Établit une connexion à PostgreSQL."""
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
    )


def _row_to_book(row) -> Book:
    return Book(
        id=int(row[0]),
        titre=str(row[1]),
        auteur=str(row[2]),
        categorie=str(row[3] or ""),
        isbn=str(row[4] or ""),
    )


# --- GESTIONNAIRE DE VIE (LIFESPAN) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    retries = 10
    print("🚀 Démarrage du service Livres...")

    while retries > 0:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS livres (
                    id SERIAL PRIMARY KEY,
                    titre VARCHAR(100) NOT NULL,
                    auteur VARCHAR(100) NOT NULL,
                    categorie VARCHAR(50)
                );
            """
            )
            conn.commit()
            cur.execute(
                "ALTER TABLE livres ADD COLUMN IF NOT EXISTS isbn VARCHAR(32) NOT NULL DEFAULT '';"
            )
            conn.commit()
            cur.close()
            conn.close()
            print(" Connexion à PostgreSQL réussie et table vérifiée !")
            break
        except Exception as e:
            retries -= 1
            print(f"⌛ En attente de la base de données... ({retries} essais restants): {e}")
            time.sleep(5)

    if retries == 0:
        print(" Impossible de se connecter à la base de données. Fermeture.")

    yield

    print("👋 Fermeture du service Livres...")


# --- INITIALISATION DE L'APP ---
app = FastAPI(title="Service de Gestion des Livres", lifespan=lifespan)

_cors_origins_raw = os.getenv(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174,"
    "http://localhost:4173,http://127.0.0.1:4173",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins_raw.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- ENDPOINTS API ---


@app.get("/")
def read_root():
    return {"status": "Service Livres Opérationnel", "database": DB_NAME}


@app.get("/books", response_model=PaginatedBooks)
async def get_books(
    page: int = Query(1, ge=1, description="Numéro de page (base 1)"),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = Query(
        None,
        max_length=200,
        description="Filtre sur titre, auteur, catégorie ou ISBN (recherche partielle)",
    ),
):
    """
    Liste paginée des livres. Paramètre `q` optionnel pour filtrer côté serveur.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    where_sql = ""
    params: list = []
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        where_sql = (
            " WHERE (titre ILIKE %s OR auteur ILIKE %s OR categorie ILIKE %s OR isbn ILIKE %s)"
        )
        params = [pattern, pattern, pattern, pattern]

    cur.execute(f"SELECT COUNT(*) FROM livres{where_sql}", params)
    total = int(cur.fetchone()[0])

    offset = (page - 1) * page_size
    order_sql = " ORDER BY id ASC LIMIT %s OFFSET %s"
    cur.execute(
        f"SELECT id, titre, auteur, categorie, isbn FROM livres{where_sql}{order_sql}",
        params + [page_size, offset],
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    items = [_row_to_book(r) for r in rows]
    return PaginatedBooks(items=items, total=total, page=page, page_size=page_size)


@app.post("/books", response_model=Book, status_code=201)
async def add_book(book: Book):
    """Insère un nouveau livre et retourne son ID généré."""
    conn = get_db_connection()
    cur = conn.cursor()
    cat = book.categorie or ""
    isbn = book.isbn or ""
    cur.execute(
        "INSERT INTO livres (titre, auteur, categorie, isbn) VALUES (%s, %s, %s, %s) RETURNING id",
        (book.titre, book.auteur, cat, isbn),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return Book(id=int(new_id), titre=book.titre, auteur=book.auteur, categorie=cat, isbn=isbn)


@app.put("/books/{book_id}", response_model=Book)
async def update_book(book_id: int, book: Book):
    """Met à jour un livre existant."""
    conn = get_db_connection()
    cur = conn.cursor()
    cat = book.categorie or ""
    isbn = book.isbn or ""
    cur.execute(
        "UPDATE livres SET titre=%s, auteur=%s, categorie=%s, isbn=%s WHERE id=%s",
        (book.titre, book.auteur, cat, isbn, book_id),
    )
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    conn.commit()
    cur.close()
    conn.close()
    return Book(id=book_id, titre=book.titre, auteur=book.auteur, categorie=cat, isbn=isbn)


@app.delete("/books/{book_id}", status_code=204)
async def delete_book(book_id: int):
    """Supprime un livre définitivement."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM livres WHERE id = %s", (book_id,))
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    conn.commit()
    cur.close()
    conn.close()
    return None


@app.get("/books/search/{titre}", response_model=List[Book])
async def search_by_title(titre: str):
    """Recherche des livres par une partie du titre (endpoint historique)."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, titre, auteur, categorie, isbn FROM livres WHERE titre ILIKE %s",
        (f"%{titre}%",),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_row_to_book(r) for r in rows]
