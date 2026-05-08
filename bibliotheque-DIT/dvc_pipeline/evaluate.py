"""
Étape 3 du pipeline DVC : évaluation du modèle
Input  : data/loans_clean.csv  +  models/model.pkl
Output : metrics.json
"""
import pandas as pd
import joblib
import json
import os

INPUT      = os.environ.get('INPUT_PATH',   'dvc_pipeline/data/loans_clean.csv')
MODEL_PATH = os.environ.get('MODEL_PATH',   'dvc_pipeline/models/model.pkl')
METRICS    = os.environ.get('METRICS_PATH', 'dvc_pipeline/metrics.json')


def evaluate():
    print("[evaluate] Chargement du modèle et des données...")
    df    = pd.read_csv(INPUT)
    saved = joblib.load(MODEL_PATH)
    model = saved['model']
    mtype = saved['model_type']

    metrics = {
        'model_type':     mtype,
        'n_users':        int(df['user_id'].nunique()),
        'n_items':        int(df['livre_id'].nunique()),
        'n_interactions': int(len(df)),
    }

    if mtype in ('SVD', 'KNN'):
        try:
            from surprise import Dataset, Reader
            from surprise.model_selection import train_test_split
            from surprise import accuracy

            reader = Reader(rating_scale=(1, 5))
            data   = Dataset.load_from_df(df[['user_id', 'livre_id', 'rating']], reader)
            trainset, testset = train_test_split(data, test_size=0.2, random_state=42)
            model.fit(trainset)
            preds = model.test(testset)

            metrics['rmse'] = round(float(accuracy.rmse(preds, verbose=False)), 4)
            metrics['mae']  = round(float(accuracy.mae(preds,  verbose=False)), 4)
            print(f"[evaluate] RMSE : {metrics['rmse']}  |  MAE : {metrics['mae']}")

        except Exception as e:
            print(f"[evaluate] Impossible de calculer RMSE/MAE : {e}")
            metrics['rmse'] = None
            metrics['mae']  = None
    else:
        metrics['rmse'] = None
        metrics['mae']  = None

    with open(METRICS, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"[evaluate] ✅ Métriques sauvegardées → {METRICS}")
    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == '__main__':
    evaluate()
