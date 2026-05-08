"""
Étape 2 du pipeline DVC : entraînement du modèle SVD/KNN
Input  : data/loans_clean.csv
Output : models/model.pkl
"""
import pandas as pd
import joblib
import os
import yaml

INPUT      = os.environ.get('INPUT_PATH',  'dvc_pipeline/data/loans_clean.csv')
MODEL_PATH = os.environ.get('MODEL_PATH',  'dvc_pipeline/models/model.pkl')
PARAMS     = 'dvc_pipeline/params.yaml'


def load_params():
    with open(PARAMS) as f:
        return yaml.safe_load(f)


def train():
    print(f"[train] Lecture de {INPUT}...")
    df     = pd.read_csv(INPUT)
    params = load_params()
    model_type = params.get('model', {}).get('type', 'SVD')

    print(f"[train] Modèle : {model_type} | "
          f"{df['user_id'].nunique()} users | {df['livre_id'].nunique()} livres")

    all_items      = df['livre_id'].unique().tolist()
    user_items_map = df.groupby('user_id')['livre_id'].apply(list).to_dict()

    try:
        from surprise import SVD, KNNBasic, Dataset, Reader
        reader   = Reader(rating_scale=(1, 5))
        data     = Dataset.load_from_df(df[['user_id', 'livre_id', 'rating']], reader)
        trainset = data.build_full_trainset()

        p = params.get('model', {})
        if model_type == 'KNN':
            model = KNNBasic(k=p.get('k', 20),
                             sim_options={'name': 'cosine', 'user_based': True})
        else:
            model = SVD(
                n_factors=p.get('n_factors', 50),
                n_epochs=p.get('n_epochs', 20),
                lr_all=p.get('lr_all', 0.005),
                reg_all=p.get('reg_all', 0.02),
            )
        model.fit(trainset)
        print(f"[train] ✅ Modèle {model_type} entraîné avec succès.")

    except ImportError:
        print("[train] scikit-surprise non disponible → modèle popularité (fallback)")
        model_type = 'Popularity'
        popularity = (
            df.groupby('livre_id')
            .agg(count=('user_id', 'count'), avg_rating=('rating', 'mean'))
            .reset_index()
        )
        popularity['score'] = popularity['count'] * popularity['avg_rating']
        model = popularity.sort_values('score', ascending=False)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({
        'model': model,
        'model_type': model_type,
        'all_items': all_items,
        'user_items_map': user_items_map,
    }, MODEL_PATH)
    print(f"[train] ✅ Modèle sauvegardé → {MODEL_PATH}")


if __name__ == '__main__':
    train()
