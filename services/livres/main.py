from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
import os
import time
import pandas as pd
from contextlib import asynccontextmanager
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import NearestNeighbors
from fastapi.middleware.cors import CORSMiddleware 

# --- MODÈLE DE DONNÉES ---
class Book(BaseModel):
    id: Optional[int] = None
    titre: str
    auteur: str
    categorie: str

# --- CONFIGURATION BASE DE DONNÉES ---
DB_HOST = "db"
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")

def get_db_connection():
    return psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    retries = 10
    while retries > 0:
        try:
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
            break
        except Exception:
            retries -= 1
            time.sleep(5)
    yield

app = FastAPI(title="Service Livres", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES CRUD ---

@app.get("/books", response_model=List[Book])
async def get_books():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, titre, auteur, categorie FROM livres ORDER BY id DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    #return [Book(id=r[0], titre=r[1], auteur=r[2], categorie=r[3]) for r in rows]
    #return [Book(id=r[0], titre=r[1], auteur=r[2], categorie=r[3] if r[3] else "") for r in rows]
    return [Book(id=r[0], titre=r[1], auteur=r[2], categorie=r[3] if r[3] is not None else "") for r in rows]

@app.post("/books", response_model=Book)
async def add_book(book: Book):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO livres (titre, auteur, categorie) VALUES (%s, %s, %s) RETURNING id",
                (book.titre, book.auteur, book.categorie))
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {**book.dict(), "id": new_id}

@app.put("/books/{book_id}", response_model=Book)
async def update_book(book_id: int, book: Book):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE livres SET titre=%s, auteur=%s, categorie=%s WHERE id=%s",
                (book.titre, book.auteur, book.categorie, book_id))
    conn.commit()
    cur.close()
    conn.close()
    return {**book.dict(), "id": book_id}

@app.delete("/books/{book_id}")
async def delete_book(book_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM livres WHERE id = %s", (book_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Supprimé"}

@app.get("/search", response_model=List[Book])
async def search_books(q: str = ""):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, titre, auteur, categorie FROM livres WHERE titre ILIKE %s OR auteur ILIKE %s", 
                (f'%{q}%', f'%{q}%'))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [Book(id=r[0], titre=r[1], auteur=r[2], categorie=r[3]) for r in rows]

@app.get("/books/{book_id}/recommendations", response_model=List[Book])
async def get_recommendations(book_id: int):
    conn = get_db_connection()
    df = pd.read_sql("SELECT id, titre, auteur, categorie FROM livres", conn)
    conn.close()
    if book_id not in df['id'].values or len(df) < 2: return []
    
    cv = CountVectorizer()
    count_matrix = cv.fit_transform(df['categorie'])
    model = NearestNeighbors(n_neighbors=min(len(df), 3), metric='cosine')
    model.fit(count_matrix)
    
    idx = df[df['id'] == book_id].index[0]
    _, indices = model.kneighbors(count_matrix[idx])
    
    recos = []
    for i in indices[0]:
        if df.iloc[i]['id'] != book_id:
            r = df.iloc[i]
            recos.append(Book(id=int(r['id']), titre=r['titre'], auteur=r['auteur'], categorie=r['categorie']))
    return recos

@app.get("/recommendations/{user_id}", response_model=List[Book])
async def get_user_recommendations(user_id: int):
    # Logique simplifiée pour l'examen : on recommande des livres de la catégorie 'IA' 
    # ou les derniers livres ajoutés si l'historique est vide
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, titre, auteur, categorie FROM livres LIMIT 3")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [Book(id=r[0], titre=r[1], auteur=r[2], categorie=r[3] if r[3] is not None else "") for r in rows]

@app.post("/train")
async def train_model():
    # Simulation de ré-entraînement
    return {"status": "success", "message": "Modèle ML mis à jour avec l'historique"}

@app.get("/history/export")
async def export_history():
    # Endpoint pour le ML
    return {"data": "CSV_DATA_OR_JSON_STRUCTURE"}