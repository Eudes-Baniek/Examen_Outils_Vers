from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pickle
import os
import requests

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.getenv("MODEL_PATH", "/models/model.pkl")
BOOKS_SERVICE_URL = os.getenv("BOOKS_SERVICE_URL", "http://livres:8000")


def load_model():
    if not os.path.exists(MODEL_PATH):
        print(f"ERREUR : Le fichier {MODEL_PATH} est introuvable dans le conteneur.")
        return None
    try:
        with open(MODEL_PATH, "rb") as model_file:
            return pickle.load(model_file)
    except Exception as exc:
        print(f"ERREUR Technique lors du pickle.load : {exc}")
        return None


def fetch_catalog_books():
    try:
        response = requests.get(f"{BOOKS_SERVICE_URL}/books", timeout=5)
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        print(f"ERREUR : catalogue livres indisponible ({exc})")
        return []


def format_books(books):
    return [
        {
            "id": book["id"],
            "titre": book.get("titre", "Livre"),
            "auteur": book.get("auteur", ""),
            "categorie": book.get("categorie") or "",
        }
        for book in books
    ]


def recommend_book_ids(user_id, model, matrix):
    if user_id not in matrix.index:
        return []

    user_vector = matrix.loc[user_id].values.reshape(1, -1)
    n_neighbors = min(3, len(matrix.index))
    _, indices = model.kneighbors(user_vector, n_neighbors=n_neighbors)
    borrowed_books = set(matrix.columns[matrix.loc[user_id] > 0])
    neighbor_users = [matrix.index[position] for position in indices[0]]
    reco_ids = []
    for neighbor_user in neighbor_users:
        if neighbor_user == user_id:
            continue
        for book_id in matrix.columns[matrix.loc[neighbor_user] > 0]:
            if book_id in borrowed_books or book_id in reco_ids:
                continue
            reco_ids.append(int(book_id))
            if len(reco_ids) >= 3:
                return reco_ids
    return reco_ids


def build_recommendations(user_id, model, matrix):
    catalog = fetch_catalog_books()
    if not catalog:
        return []

    reco_ids = recommend_book_ids(user_id, model, matrix)
    if reco_ids:
        books_by_id = {book["id"]: book for book in catalog}
        selected = [books_by_id[book_id] for book_id in reco_ids if book_id in books_by_id]
        if selected:
            return format_books(selected)

    borrowed_ids = set()
    if user_id in matrix.index:
        borrowed_ids = {int(book_id) for book_id in matrix.columns[matrix.loc[user_id] > 0]}

    fallback = [book for book in catalog if book["id"] not in borrowed_ids][:3]
    return format_books(fallback)


@app.get("/recommendations/{user_id}")
async def get_reco(user_id: int):
    data = load_model()
    if not data:
        raise HTTPException(status_code=404, detail="Modèle non disponible. Lancez dvc repro.")

    return build_recommendations(user_id, data["model"], data["matrix"])


@app.post("/train")
async def trigger_train():
    print("LOG : Demande de réentraînement reçue. Exporter les emprunts puis lancer py -m dvc repro sur l'hôte.")
    return {
        "status": "success",
        "message": "Exportez les emprunts via GET /loans/export, puis exécutez py -m dvc repro à la racine du projet.",
    }
