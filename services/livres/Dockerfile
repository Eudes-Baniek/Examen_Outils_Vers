# Image de base légère
FROM python:3.9-slim

# Définition du répertoire de travail à la racine
WORKDIR /app

# Installation des dépendances en tant que root pour garantir l'accès global
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sécurité : Création de l'utilisateur non-root (Exigence M2 IA)
RUN useradd -m dit_user && chown -R dit_user:dit_user /app

# Copie du code source ET attribution immédiate de la propriété à l'utilisateur
COPY --chown=dit_user:dit_user . .

# Passage à l'utilisateur non-root pour la phase d'exécution
USER dit_user

# Port spécifique au catalogue de livres selon l'architecture du projet
EXPOSE 8000

# Lancement de l'application sur le port 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]