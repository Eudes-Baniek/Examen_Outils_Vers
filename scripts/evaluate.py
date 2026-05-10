import json
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error
import pickle

def evaluate():
    input_path = 'data/loans_clean.csv'
    model_path = 'models/model.pkl'
    
    # Chargement des données et du modèle
    df = pd.read_csv(input_path)
    with open(model_path, 'rb') as f:
        data = pickle.load(f)
        matrix = data['matrix']
    
    # Calcul simplifié des métriques (RMSE/MAE)
    # Dans un cadre réel, on comparerait les prédictions aux tests
    y_true = matrix.values.flatten()
    y_pred = np.zeros_like(y_true) # Simulation de prédiction pour l'exemple
    
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)
    
    metrics = {
        "rmse": float(rmse),
        "mae": float(mae)
    }
    
    # Sauvegarde des métriques pour DVC
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
        
    print("Évaluation terminée : metrics.json généré.")

if __name__ == "__main__":
    evaluate()