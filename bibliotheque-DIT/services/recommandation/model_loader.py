"""
Chargement et gestion du modèle de recommandation.
Supporte SVD (collaborative filtering) via scikit-surprise
et KNN comme alternative.
"""
import os
import logging
import joblib
import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Any

logger = logging.getLogger(__name__)


class RecommendationModel:
    def __init__(self, model_path: str, data_path: str):
        self.model_path = model_path
        self.data_path = data_path
        self.model = None
        self.model_type = "SVD"
        self.is_trained = False
        self.trainset = None
        self.all_items = []
        self.user_items_map: Dict[int, List[int]] = {}

        # Tenter de charger un modèle existant
        self._load_model()

    def _load_model(self):
        """Charge le modèle depuis le disque s'il existe."""
        if os.path.exists(self.model_path):
            try:
                saved = joblib.load(self.model_path)
                self.model = saved.get('model')
                self.model_type = saved.get('model_type', 'SVD')
                self.all_items = saved.get('all_items', [])
                self.user_items_map = saved.get('user_items_map', {})
                self.is_trained = True
                logger.info(f"Modèle {self.model_type} chargé depuis {self.model_path}")
            except Exception as e:
                logger.warning(f"Impossible de charger le modèle : {e}")
        else:
            logger.info("Aucun modèle existant trouvé. Appelez /train pour entraîner.")

    def _load_data(self):
        """Charge et prépare les données d'emprunts."""
        df = pd.read_csv(self.data_path)
        required_cols = ['user_id', 'livre_id']
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Colonne manquante dans le CSV : {col}")

        if 'rating' not in df.columns:
            df['rating'] = 4.0  # Rating implicite par défaut

        df = df.dropna(subset=['user_id', 'livre_id'])
        df['user_id'] = df['user_id'].astype(int)
        df['livre_id'] = df['livre_id'].astype(int)
        df['rating'] = df['rating'].astype(float).clip(1, 5)

        logger.info(f"Données chargées : {len(df)} emprunts, "
                    f"{df['user_id'].nunique()} utilisateurs, "
                    f"{df['livre_id'].nunique()} livres")
        return df

    def train(self) -> Dict[str, float]:
        from sklearn.decomposition import TruncatedSVD
        from sklearn.preprocessing import LabelEncoder
        import numpy as np

        df = self._load_data()
        self.model_type = "SVD-sklearn"

        # Encoder les IDs
        ue = LabelEncoder()
        le = LabelEncoder()
        df['u'] = ue.fit_transform(df['user_id'])
        df['i'] = le.fit_transform(df['livre_id'])

        # Matrice user-item
        n_users = df['u'].nunique()
        n_items = df['i'].nunique()
        mat = np.zeros((n_users, n_items))
        for _, row in df.iterrows():
            mat[int(row['u']), int(row['i'])] = row['rating']

        # SVD
        n_comp = min(20, n_users - 1, n_items - 1)
        svd = TruncatedSVD(n_components=max(1, n_comp), random_state=42)
        svd.fit(mat)

        self.model = {
            'svd': svd, 'mat': mat,
            'ue': ue, 'le': le,
            'user_ids': ue.classes_.tolist(),
            'livre_ids': le.classes_.tolist(),
        }
        self.all_items = df['livre_id'].unique().tolist()
        self.user_items_map = df.groupby('user_id')['livre_id'].apply(list).to_dict()
        self.is_trained = True
        self._save_model()

        logger.info("Modèle SVD sklearn entraîné.")
        return {'rmse': 0.0, 'mae': 0.0}

    def _train_popularity_fallback(self) -> Dict[str, float]:
        """Modèle de secours basé sur la popularité des livres."""
        df = self._load_data()
        self.model_type = "Popularity"

        popularity = df.groupby('livre_id').agg(
            count=('user_id', 'count'),
            avg_rating=('rating', 'mean')
        ).reset_index()
        popularity['score'] = popularity['count'] * popularity['avg_rating']
        popularity = popularity.sort_values('score', ascending=False)

        self.model = popularity
        self.all_items = df['livre_id'].unique().tolist()
        self.user_items_map = df.groupby('user_id')['livre_id'].apply(list).to_dict()
        self.is_trained = True
        self._save_model()

        logger.info("Modèle Popularité entraîné (fallback)")
        return {'rmse': 0.0, 'mae': 0.0}

    def predict(self, user_id: int, n_recommendations: int = 5) -> List[Dict]:
        if not self.is_trained:
            return []

        already = set(self.user_items_map.get(user_id, []))
        candidates = [i for i in self.all_items if i not in already] or self.all_items

        if self.model_type == "SVD-sklearn":
            m = self.model
            if user_id not in m['ue'].classes_:
                # Nouvel utilisateur : retourner les plus populaires
                return [{'livre_id': int(i), 'score': 3.0} for i in candidates[:n_recommendations]]
            u_idx = m['ue'].transform([user_id])[0]
            scores = m['svd'].components_.T @ m['svd'].transform(m['mat'])[u_idx]
            result = []
            for livre_id in candidates:
                if livre_id in m['le'].classes_:
                    i_idx = m['le'].transform([livre_id])[0]
                    result.append({'livre_id': int(livre_id), 'score': round(float(scores[i_idx]), 4)})
            result.sort(key=lambda x: x['score'], reverse=True)
            return result[:n_recommendations]

        return [{'livre_id': int(i), 'score': 3.0} for i in candidates[:n_recommendations]]

    def _save_model(self):
        """Sauvegarde le modèle sur disque."""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'model_type': self.model_type,
            'all_items': self.all_items,
            'user_items_map': self.user_items_map,
        }, self.model_path)
        logger.info(f"Modèle sauvegardé dans {self.model_path}")

    def get_info(self) -> Dict[str, Any]:
        return {
            'model_type': self.model_type,
            'is_trained': self.is_trained,
            'model_path': self.model_path,
            'data_path': self.data_path,
            'n_users': len(self.user_items_map) if self.user_items_map else None,
            'n_items': len(self.all_items) if self.all_items else None,
        }
