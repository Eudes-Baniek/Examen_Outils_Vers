"""
Service Recommandations — suggestions dérivées du fonds Livres (déterministe par user_id).
"""

from __future__ import annotations

import os
import time
from contextlib import asynccontextmanager
from typing import List

import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_HOST = os.getenv("POSTGRES_HOST", os.getenv("DB_HOST", "db"))
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")


def get_db():
    return psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)


class LivreReco(BaseModel):
    id: int
    titre: str
    auteur: str
    categorie: str
    score: float = Field(ge=0, le=1, description="Pertinence heuristique 0–1")


@asynccontextmanager
async def lifespan(app: FastAPI):
    retries = 10
    while retries > 0:
        try:
            conn = get_db()
            conn.close()
            print("Service Reco connecté à la base.")
            break
        except Exception as e:
            retries -= 1
            print(f"Reco attend PostgreSQL ({retries}): {e}")
            time.sleep(5)
    yield
    print("Arrêt service Reco")


app = FastAPI(title="Service Recommandations", lifespan=lifespan)

_cors = os.getenv(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174,"
    "http://localhost:4173,http://127.0.0.1:4173",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "service": "recommendations"}


@app.get("/recommendations/{user_id}", response_model=List[LivreReco])
async def reco_pour_utilisateur(user_id: str):
    """Sélection déterministe depuis le catalogue livres (placeholder avant modèle ML)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, titre, auteur, categorie FROM livres ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return []

    h = sum(ord(c) for c in user_id) if user_id else 0
    n = len(rows)
    offset = h % max(1, n)
    out: List[LivreReco] = []
    for i in range(min(24, n)):
        idx = (offset + i) % n
        book_id, titre, auteur, cat = rows[idx]
        score = round(0.55 + ((h + book_id + i) % 40) / 100, 2)
        out.append(
            LivreReco(
                id=int(book_id),
                titre=str(titre),
                auteur=str(auteur),
                categorie=str(cat or ""),
                score=min(0.98, score),
            )
        )
    return out
