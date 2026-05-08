"""
Service de Recommandation — FastAPI
Endpoints :
  GET  /                            - Health check
  GET  /recommendations/{user_id}  - Recommandations pour un utilisateur
  POST /train                       - Ré-entraîner le modèle
  GET  /model/info                  - Info sur le modèle chargé
"""
import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_loader import RecommendationModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="API Recommandation — Bibliothèque DIT",
    description="Système de recommandation de livres basé sur l'historique des emprunts",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.environ.get('MODEL_PATH', '/app/models/model.pkl')
DATA_PATH = os.environ.get('DATA_PATH', '/app/data/loans.csv')

# Charger le modèle au démarrage
reco_model = RecommendationModel(MODEL_PATH, DATA_PATH)


# ── Schémas Pydantic ──────────────────────────────────────────────────

class RecommendationItem(BaseModel):
    livre_id: int
    score: float
    rang: int


class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[RecommendationItem]
    model_type: str
    message: str


class TrainResponse(BaseModel):
    success: bool
    message: str
    rmse: Optional[float] = None
    mae: Optional[float] = None


class ModelInfo(BaseModel):
    model_type: str
    is_trained: bool
    model_path: str
    data_path: str
    n_users: Optional[int] = None
    n_items: Optional[int] = None


# ── Endpoints ─────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "recommandation",
        "model_loaded": reco_model.is_trained
    }


@app.get(
    "/recommendations/{user_id}",
    response_model=RecommendationResponse,
    tags=["Recommandations"]
)
def get_recommendations(user_id: int, n: int = 5):
    """
    Retourne les N meilleurs livres recommandés pour un utilisateur.
    - **user_id** : identifiant de l'utilisateur
    - **n** : nombre de recommandations (défaut: 5)
    """
    if not reco_model.is_trained:
        raise HTTPException(
            status_code=503,
            detail="Le modèle n'est pas encore entraîné. Appelez POST /train d'abord."
        )

    try:
        recommendations = reco_model.predict(user_id, n_recommendations=n)
        if not recommendations:
            return RecommendationResponse(
                user_id=user_id,
                recommendations=[],
                model_type=reco_model.model_type,
                message=f"Aucune recommandation disponible pour l'utilisateur {user_id}. "
                        f"Peut-être qu'il n'a pas encore d'historique d'emprunts."
            )

        items = [
            RecommendationItem(livre_id=r['livre_id'], score=r['score'], rang=i+1)
            for i, r in enumerate(recommendations)
        ]
        return RecommendationResponse(
            user_id=user_id,
            recommendations=items,
            model_type=reco_model.model_type,
            message=f"{len(items)} livre(s) recommandé(s) pour l'utilisateur {user_id}"
        )

    except Exception as e:
        logger.error(f"Erreur lors de la recommandation pour user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train", response_model=TrainResponse, tags=["Modèle"])
def train_model(background_tasks: BackgroundTasks):
    """
    Lance le ré-entraînement du modèle ML sur les données actuelles.
    L'entraînement se fait en arrière-plan.
    """
    if not os.path.exists(DATA_PATH):
        raise HTTPException(
            status_code=404,
            detail=f"Fichier de données introuvable : {DATA_PATH}. "
                   f"Exportez d'abord les données depuis le service Emprunts."
        )

    try:
        metrics = reco_model.train()
        return TrainResponse(
            success=True,
            message="Modèle entraîné avec succès et sauvegardé.",
            rmse=metrics.get('rmse'),
            mae=metrics.get('mae')
        )
    except Exception as e:
        logger.error(f"Erreur lors de l'entraînement : {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/info", response_model=ModelInfo, tags=["Modèle"])
def model_info():
    """Informations sur le modèle actuellement chargé."""
    info = reco_model.get_info()
    return ModelInfo(**info)
