from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import psycopg2
import os

app = FastAPI(title="Service de Gestion des Livres")

# --- MODÈLE DE DONNÉES ---
class Book(BaseModel):
    id: int = None
    titre: str
    auteur: str
    categorie: str

# --- CONFIGURATION BASE DE DONNÉES ---
DB_HOST = "db"
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST, 
        database=DB_NAME, 
        user=DB_USER, 
        password=DB_PASS
    )

# --- INITIALISATION AU DÉMARRAGE ---
@app.on_event("startup")
def startup_event():
    """Crée la table au lancement si elle n'existe pas."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS livres (
            id SERIAL PRIMARY KEY,
            titre VARCHAR(100) NOT NULL,
            auteur VARCHAR(100) NOT NULL,
            categorie VARCHAR(50)
        );
    ''')
    conn.commit()
    cur.close()
    conn.close()

# --- ENDPOINTS API ---

@app.get("/")
def read_root():
    return {"status": "Service Livres Opérationnel", "database": DB_NAME}

@app.get("/books", response_model=List[Book])
async def get_books():
    """Récupère tous les livres depuis la base de données."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, titre, auteur, categorie FROM livres")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [Book(id=r[0], titre=r[1], auteur=r[2], categorie=r[3]) for r in rows]

@app.post("/books", response_model=Book, status_code=201)
async def add_book(book: Book):
    """Insère un nouveau livre et retourne son ID généré."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO livres (titre, auteur, categorie) VALUES (%s, %s, %s) RETURNING id",
        (book.titre, book.auteur, book.categorie)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {**book.dict(), "id": new_id}

@app.put("/books/{book_id}", response_model=Book)
async def update_book(book_id: int, book: Book):
    """Met à jour un livre existant."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE livres SET titre=%s, auteur=%s, categorie=%s WHERE id=%s",
        (book.titre, book.auteur, book.categorie, book_id)
    )
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    conn.commit()
    cur.close()
    conn.close()
    return {**book.dict(), "id": book_id}

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
    """Recherche des livres par une partie du titre."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, titre, auteur, categorie FROM livres WHERE titre ILIKE %s", (f'%{titre}%',))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [Book(id=r[0], titre=r[1], auteur=r[2], categorie=r[3]) for r in rows]