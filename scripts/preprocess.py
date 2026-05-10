import pandas as pd
import os

def preprocess():
    input_path = 'data/loans.csv'
    output_path = 'data/loans_clean.csv'
    
    if not os.path.exists(input_path):
        print(f"Erreur : {input_path} introuvable. Créez un CSV avec les colonnes user_id, book_id.")
        return

    # Chargement des données
    df = pd.read_csv(input_path)
    
    # Nettoyage simple : suppression des doublons et des valeurs vides
    df_clean = df.dropna().drop_duplicates()
    
    # S'assurer que le dossier data existe
    os.makedirs('data', exist_ok=True)
    
    # Sauvegarde
    df_clean.to_csv(output_path, index=False)
    print(f"Prétraitement terminé : {output_path} généré.")

if __name__ == "__main__":
    preprocess()