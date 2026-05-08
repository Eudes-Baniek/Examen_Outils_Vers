"""
Étape 1 du pipeline DVC : nettoyage des données
Input  : data/loans.csv
Output : data/loans_clean.csv
"""
import pandas as pd
import os

INPUT  = os.environ.get('INPUT_PATH',  'dvc_pipeline/data/loans.csv')
OUTPUT = os.environ.get('OUTPUT_PATH', 'dvc_pipeline/data/loans_clean.csv')


def preprocess():
    print(f"[preprocess] Lecture de {INPUT}...")
    df = pd.read_csv(INPUT)
    print(f"[preprocess] {len(df)} lignes lues.")

    # Supprimer les doublons
    df = df.drop_duplicates(subset=['user_id', 'livre_id', 'date_emprunt'])

    # Supprimer les lignes avec user_id ou livre_id manquants
    df = df.dropna(subset=['user_id', 'livre_id'])

    # Convertir les types
    df['user_id']  = df['user_id'].astype(int)
    df['livre_id'] = df['livre_id'].astype(int)

    # Rating par défaut si absent
    if 'rating' not in df.columns:
        df['rating'] = 4.0
    df['rating'] = df['rating'].fillna(4.0).clip(1, 5)

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    df.to_csv(OUTPUT, index=False)
    print(f"[preprocess] ✅ {len(df)} lignes propres → {OUTPUT}")
    return df


if __name__ == '__main__':
    preprocess()
