"""
Service Utilisateurs — comptes étudiant / personnel / professeur (PostgreSQL).
"""

from __future__ import annotations

import os
import time
from contextlib import asynccontextmanager
from datetime import datetime
from enum import Enum
from typing import List, Optional

import bcrypt
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


class Role(str, Enum):
    etudiant = "etudiant"
    personnel = "personnel"
    professeur = "professeur"


DB_HOST = os.getenv("POSTGRES_HOST", os.getenv("DB_HOST", "db"))
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")


def get_db():
    return psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)


def hash_mot_de_passe(plaintext: str) -> str:
    return bcrypt.hashpw(plaintext.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_mot_de_passe(plaintext: str, hashed: str) -> bool:
    return bcrypt.checkpw(plaintext.encode("utf-8"), hashed.encode("utf-8"))


class UtilisateurCreate(BaseModel):
    role: Role
    email: EmailStr
    nom: str = Field(..., min_length=1, max_length=120)
    prenom: Optional[str] = Field(None, max_length=120)
    password: str = Field(..., min_length=6, max_length=200)
    num_etudiant: Optional[str] = Field(None, max_length=64)
    service: Optional[str] = Field(None, max_length=120)
    departement: Optional[str] = Field(None, max_length=120)


class UtilisateurUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nom: Optional[str] = Field(None, min_length=1, max_length=120)
    prenom: Optional[str] = Field(None, max_length=120)
    password: Optional[str] = Field(None, min_length=6, max_length=200)
    num_etudiant: Optional[str] = Field(None, max_length=64)
    service: Optional[str] = Field(None, max_length=120)
    departement: Optional[str] = Field(None, max_length=120)


class UtilisateurPublic(BaseModel):
    id: int
    role: Role
    email: str
    nom: str
    prenom: Optional[str] = None
    num_etudiant: Optional[str] = None
    service: Optional[str] = None
    departement: Optional[str] = None
    cree_le: datetime


def _row_to_public(row) -> UtilisateurPublic:
    (
        pid,
        role,
        email,
        nom,
        prenom,
        num_etudiant,
        service,
        departement,
        cree_le,
    ) = row
    return UtilisateurPublic(
        id=int(pid),
        role=Role(role),
        email=str(email),
        nom=str(nom),
        prenom=str(prenom) if prenom else None,
        num_etudiant=str(num_etudiant) if num_etudiant else None,
        service=str(service) if service else None,
        departement=str(departement) if departement else None,
        cree_le=cree_le,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    retries = 10
    while retries > 0:
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS utilisateurs (
                    id SERIAL PRIMARY KEY,
                    role VARCHAR(20) NOT NULL
                      CHECK (role IN ('etudiant','personnel','professeur')),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    nom VARCHAR(120) NOT NULL,
                    prenom VARCHAR(120),
                    mot_de_passe_hash VARCHAR(255) NOT NULL,
                    num_etudiant VARCHAR(64),
                    service VARCHAR(120),
                    departement VARCHAR(120),
                    cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            conn.commit()
            cur.execute("SELECT COUNT(*) FROM utilisateurs")
            if cur.fetchone()[0] == 0:
                demo = hash_mot_de_passe("demo123!")
                inserts = [
                    (
                        Role.etudiant.value,
                        "etudiant.demo@univ.local",
                        "Dupont",
                        "Jean",
                        "E-2026-001",
                        None,
                        None,
                        demo,
                    ),
                    (
                        Role.personnel.value,
                        "admin.bibliotheque@univ.local",
                        "Bernard",
                        "Sophie",
                        None,
                        "Accueil",
                        None,
                        demo,
                    ),
                    (
                        Role.professeur.value,
                        "prof.ml@univ.local",
                        "Martin",
                        "Paul",
                        None,
                        None,
                        "Informatique",
                        demo,
                    ),
                ]
                cur.executemany(
                    """
                    INSERT INTO utilisateurs
                      (role, email, nom, prenom, num_etudiant, service, departement, mot_de_passe_hash)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    inserts,
                )
                conn.commit()
            cur.close()
            conn.close()
            print("Service Utilisateurs prêt.")
            break
        except Exception as e:
            retries -= 1
            print(f"En attente PostgreSQL ({retries} essais restants): {e}")
            time.sleep(5)
    yield
    print("Arrêt service Utilisateurs")


app = FastAPI(title="Service Utilisateurs", lifespan=lifespan)

_DEV_VITE_PORTS = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174,"
    "http://localhost:4173,http://127.0.0.1:4173"
)
_cors = os.getenv("CORS_ALLOW_ORIGINS", _DEV_VITE_PORTS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "service": "utilisateurs"}


@app.get("/utilisateurs", response_model=List[UtilisateurPublic])
async def liste_utilisateurs():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, role, email, nom, prenom, num_etudiant, service, departement, cree_le
        FROM utilisateurs ORDER BY id ASC
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_row_to_public(r) for r in rows]


@app.get("/utilisateurs/ids")
async def ids_utilisateurs():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM utilisateurs ORDER BY id ASC")
    ids = [int(r[0]) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return {"ids": ids}


@app.get("/utilisateurs/{user_id}", response_model=UtilisateurPublic)
async def get_utilisateur(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, role, email, nom, prenom, num_etudiant, service, departement, cree_le
        FROM utilisateurs WHERE id = %s
        """,
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return _row_to_public(row)


@app.post("/utilisateurs", response_model=UtilisateurPublic, status_code=201)
async def creer_utilisateur(body: UtilisateurCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM utilisateurs WHERE email = %s", (str(body.email),))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=409, detail="Email déjà utilisée")

    hp = hash_mot_de_passe(body.password)
    try:
        cur.execute(
            """
            INSERT INTO utilisateurs
              (role, email, nom, prenom, num_etudiant, service, departement, mot_de_passe_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, role, email, nom, prenom, num_etudiant, service, departement, cree_le
            """,
            (
                body.role.value,
                str(body.email),
                body.nom,
                body.prenom,
                body.num_etudiant,
                body.service,
                body.departement,
                hp,
            ),
        )
        row = cur.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail=str(e)) from e
    cur.close()
    conn.close()
    return _row_to_public(row)


@app.put("/utilisateurs/{user_id}", response_model=UtilisateurPublic)
async def maj_utilisateur(user_id: int, body: UtilisateurUpdate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, role, email, nom, prenom, num_etudiant, service, departement,
               mot_de_passe_hash, cree_le
        FROM utilisateurs WHERE id = %s
        """,
        (user_id,),
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    (
        _id,
        role,
        email,
        nom,
        prenom,
        num_etudiant,
        service,
        departement,
        mot_hash,
        cree_le,
    ) = row

    new_email = str(body.email) if body.email is not None else email
    if body.email is not None and str(body.email) != email:
        cur.execute("SELECT 1 FROM utilisateurs WHERE email = %s AND id <> %s", (new_email, user_id))
        if cur.fetchone():
            cur.close()
            conn.close()
            raise HTTPException(status_code=409, detail="Email déjà utilisée")

    new_nom = body.nom if body.nom is not None else nom
    new_prenom = body.prenom if body.prenom is not None else prenom
    new_ne = body.num_etudiant if body.num_etudiant is not None else num_etudiant
    new_srv = body.service if body.service is not None else service
    new_dep = body.departement if body.departement is not None else departement
    new_hash = hash_mot_de_passe(body.password) if body.password else mot_hash

    cur.execute(
        """
        UPDATE utilisateurs SET
          email=%s, nom=%s, prenom=%s, num_etudiant=%s, service=%s, departement=%s,
          mot_de_passe_hash=%s
        WHERE id=%s
        RETURNING id, role, email, nom, prenom, num_etudiant, service, departement, cree_le
        """,
        (
            new_email,
            new_nom,
            new_prenom,
            new_ne,
            new_srv,
            new_dep,
            new_hash,
            user_id,
        ),
    )
    out = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return _row_to_public(out)


@app.delete("/utilisateurs/{user_id}", status_code=204)
async def supprimer_utilisateur(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM utilisateurs WHERE id = %s", (user_id,))
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    conn.commit()
    cur.close()
    conn.close()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.post("/utilisateurs/login")
async def login_demo(body: LoginRequest):
    """Vérification simple (démo) — sans JWT."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, role, email, nom, prenom, num_etudiant, service, departement, cree_le,
               mot_de_passe_hash
        FROM utilisateurs WHERE email = %s
        """,
        (str(body.email),),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row or not verify_mot_de_passe(body.password, row[9]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    return _row_to_public(row[:9])
