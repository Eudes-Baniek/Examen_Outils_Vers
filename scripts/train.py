import pandas as pd
import pickle
from sklearn.neighbors import NearestNeighbors
import os

def train():
    input_path = 'data/loans_clean.csv'
    model_dir = 'models'
    model_path = os.path.join(model_dir, 'model.pkl')
    
    # Chargement
    df = pd.read_csv(input_path)
    
    # Création d'une matrice simple (pivot) : Utilisateurs en lignes, Livres en colonnes
    # On met 1 si l'utilisateur a emprunté le livre
    matrix = df.pivot_table(index='user_id', columns='book_id', aggfunc='size', fill_value=0)
    
    # Modèle KNN pour trouver des similitudes entre utilisateurs
    model = NearestNeighbors(metric='cosine', algorithm='brute')
    model.fit(matrix.values)
    
    # Sauvegarde du modèle et de la structure de la matrice (nécessaire pour l'API)
    os.makedirs(model_dir, exist_ok=True)
    with open(model_path, 'wb') as f:
        pickle.dump({'model': model, 'matrix': matrix}, f)
        
    print(f"Entraînement terminé : {model_path} généré.")

if __name__ == "__main__":
    train()