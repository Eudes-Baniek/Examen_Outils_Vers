"""
Service Emprunts — prêts actifs pour l’espace lecteur (aligné avec le front).
"""

from __future__ import annotations

import os
import time
from contextlib import asynccontextmanager
from datetime import date, timedelta
from typing import List, Optional

import psycopg2
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_HOST = os.getenv("POSTGRES_HOST", os.getenv("DB_HOST", "db"))
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")


def get_db():
    return psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)


class EmpruntResponse(BaseModel):
    id: str
    livreId: int
    livreTitre: str
    livreAuteur: str
    dateEmprunt: str
    dateRetourPrevue: str
    enRetard: bool


@asynccontextmanager
async def lifespan(app: FastAPI):
    retries = 10
    while retries > 0:
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS emprunts (
                    id VARCHAR(64) PRIMARY KEY,
                    livre_id INTEGER NOT NULL,
                    livre_titre VARCHAR(200) NOT NULL,
                    livre_auteur VARCHAR(200) NOT NULL,
                    date_emprunt DATE NOT NULL,
                    date_retour_prevue DATE NOT NULL,
                    en_retard BOOLEAN NOT NULL DEFAULT FALSE
                );
                """
            )
            conn.commit()

            cur.execute("SELECT COUNT(*) FROM emprunts")
            n = cur.fetchone()[0]
            if n == 0:
                cur.execute(
                    """
                    SELECT id, titre, auteur FROM livres
                    ORDER BY id
                    LIMIT 18
                    """
                )
                rows = cur.fetchall()
                today = date.today()
                for i, (lid, titre, auteur) in enumerate(rows):
                    emp_id = f"emp-seed-{lid}"
                    borrowed = today - timedelta(days=7 + (i % 12))
                    due = borrowed + timedelta(days=14)
                    en_retard = i % 5 == 0
                    cur.execute(
                        """
                        INSERT INTO emprunts (id, livre_id, livre_titre, livre_auteur,
                          date_emprunt, date_retour_prevue, en_retard)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (
                            emp_id,
                            lid,
                            titre[:200],
                            auteur[:200],
                            borrowed.isoformat(),
                            due.isoformat() if not en_retard else (today - timedelta(days=3)).isoformat(),
                            en_retard,
                        ),
                    )
                conn.commit()

            cur.close()
            conn.close()
            print("✅ Service Emprunts prêt.")
            break
        except Exception as e:
            retries -= 1
            print(f"⌛ En attente PostgreSQL ({retries} essais restants): {e}")
            time.sleep(5)
            if retries == 0:
                print("⚠️ Démarrage sans garantie seed emprunts")

    yield
    print("👋 Arrêt service Emprunts")


app = FastAPI(title="Service Emprunts", lifespan=lifespan)

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
    return {"status": "ok", "service": "emprunts"}


def _rows_to_models(rows: list) -> List[EmpruntResponse]:
    out: List[EmpruntResponse] = []
    for r in rows:
        emp_id, lid, titre, auteur, demprunt, due, retard = r
        out.append(
            EmpruntResponse(
                id=str(emp_id),
                livreId=int(lid),
                livreTitre=str(titre),
                livreAuteur=str(auteur),
                dateEmprunt=str(demprunt),
                dateRetourPrevue=str(due),
                enRetard=bool(retard),
            )
        )
    return out


@app.get("/emprunts", response_model=List[EmpruntResponse])
async def liste_emprunts(
    retard: Optional[bool] = Query(None, description="Filtrer les retards uniquement si true"),
):
    """Liste des prêts en base (pour la démo = prêts actifs)."""
    conn = get_db()
    cur = conn.cursor()
    sql = """SELECT id, livre_id, livre_titre, livre_auteur, date_emprunt, date_retour_prevue, en_retard
             FROM emprunts"""
    if retard is True:
        sql += " WHERE en_retard IS TRUE"
    sql += " ORDER BY date_emprunt DESC"
    cur.execute(sql)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return _rows_to_models(rows)


@app.delete("/emprunts/{emp_id}", status_code=204)
async def cloturer_emprunt(emp_id: str):
    """Retour fictif — supprime la ligne pour les tests UI."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM emprunts WHERE id = %s", (emp_id,))
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Emprunt introuvable")
    conn.commit()
    cur.close()
    conn.close()
    return None
