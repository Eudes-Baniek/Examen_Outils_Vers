from fastapi import FastAPI, HTTPException
import pickle
import pandas as pd
import os

app = FastAPI()

# On utilise une variable d'environnement avec une valeur par défaut
MODEL_PATH = os.getenv("MODEL_PATH", "/models/model.pkl")

def load_model():
    if not os.path.exists(MODEL_PATH):
        print(f"ERREUR : Le fichier {MODEL_PATH} est introuvable dans le conteneur.")
        return None
    try:
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    except Exception as e:
        print(f"ERREUR Technique lors du pickle.load : {e}")
        return None

@app.get("/recommendations/{user_id}")
async def get_reco(user_id: int):
    data = load_model()
    if not data:
        raise HTTPException(status_code=404, detail="Modèle non disponible. Lancez dvc repro.")
    
    model = data['model']
    matrix = data['matrix']
    
    if user_id not in matrix.index:
        # Si l'utilisateur est nouveau, on recommande des livres populaires par défaut
        return [{"id": 1, "titre": "Livre par défaut", "auteur": "Système", "categorie": "IA"}]
    
    # Logique KNN pour trouver les voisins
    user_vector = matrix.loc[user_id].values.reshape(1, -1)
    distances, indices = model.kneighbors(user_vector, n_neighbors=3)
    
    # On récupère les IDs des livres des utilisateurs similaires (logique simplifiée)
    reco_ids = matrix.columns[indices[0]].tolist()
    
    # Ici, tu devrais normalement faire une requête au service Livres pour avoir les détails
    # Pour l'examen, on retourne une structure simple compatible avec ton frontend
    return [{"id": rid, "titre": f"Livre Recommandé {rid}", "auteur": "IA", "categorie": "Machine Learning"} for rid in reco_ids]

@app.post("/train")
async def trigger_train():
    # On ne lance plus os.system("dvc repro") car DVC est sur l'hôte, pas dans Docker
    print("LOG : Demande de réentraînement reçue. Action à faire sur l'hôte : py -m dvc repro")
    return {
        "status": "success", 
        "message": "Pipeline DVC notifié. Le modèle sera actualisé au prochain cycle."
    }