from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import psycopg2
import os
import time
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

# --- MODÈLES DE DONNÉES (Pydantic) ---
class UserBase(BaseModel):
    nom: str
    type_utilisateur: str  # Étudiant, Professeur ou Personnel
    email: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    email: str

    class Config:
        from_attributes = True

# --- CONFIGURATION DE LA BASE DE DONNÉES ---
DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")

def get_db_connection():
    """Établit une connexion à PostgreSQL"""
    return psycopg2.connect(
        host=DB_HOST, 
        database=DB_NAME, 
        user=DB_USER, 
        password=DB_PASS
    )

# --- CYCLE DE VIE (LIFESPAN) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialisation de la base de données au démarrage du conteneur"""
    print("Tentative de connexion à la base de données...")
    retries = 15  # Plus de tentatives pour laisser le temps à la DB de démarrer
    while retries > 0:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            # Création de la table avec contraintes
            cur.execute('''
                CREATE TABLE IF NOT EXISTS utilisateurs (
                    id SERIAL PRIMARY KEY,
                    nom VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    type_utilisateur VARCHAR(50) NOT NULL
                );
            ''')
            conn.commit()
            cur.close()
            conn.close()
            print("Connexion réussie et table 'utilisateurs' prête.")
            break
        except Exception as e:
            retries -= 1
            print(f"La DB n'est pas prête. Essais restants : {retries}. Erreur : {e}")
            time.sleep(3)
    yield

# --- INITIALISATION API ---
app = FastAPI(title="DIT Library - User Service", lifespan=lifespan)

# Configuration CORS pour autoriser ton interface HTML
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS ---

@app.post("/users", response_model=User, status_code=201)
async def create_user(user: UserCreate):
    """Crée un nouvel utilisateur avec génération automatique d'email si absent"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Logique pour l'email (exigence pour éviter les erreurs de contrainte UNIQUE)
        final_email = user.email if user.email else f"{user.nom.replace(' ', '').lower()}{int(time.time())}@dit.sn"
        
        cur.execute(
            "INSERT INTO utilisateurs (nom, email, type_utilisateur) VALUES (%s, %s, %s) RETURNING id",
            (user.nom, final_email, user.type_utilisateur)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return {**user.dict(), "id": new_id, "email": final_email}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création : {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.get("/users/check/{identifier}", response_model=User)
async def check_user(identifier: str):
    """Endpoint crucial pour ton bouton de connexion HTML"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Recherche par ID si c'est un chiffre, sinon par NOM
        if identifier.isdigit():
            cur.execute("SELECT id, nom, email, type_utilisateur FROM utilisateurs WHERE id = %s", (int(identifier),))
        else:
            cur.execute("SELECT id, nom, email, type_utilisateur FROM utilisateurs WHERE nom = %s", (identifier,))
        
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        return User(id=row[0], nom=row[1], email=row[2], type_utilisateur=row[3])
    finally:
        cur.close()
        conn.close()

@app.get("/users", response_model=List[User])
async def list_users():
    """Récupère la liste complète des utilisateurs"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, nom, email, type_utilisateur FROM utilisateurs")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [User(id=r[0], nom=r[1], email=r[2], type_utilisateur=r[3]) for r in rows]

@app.get("/users/{user_id}", response_model=User)
async def get_user_by_id(user_id: int):
    """Récupère un profil spécifique par son ID"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, nom, email, type_utilisateur FROM utilisateurs WHERE id = %s", (user_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return User(id=row[0], nom=row[1], email=row[2], type_utilisateur=row[3])