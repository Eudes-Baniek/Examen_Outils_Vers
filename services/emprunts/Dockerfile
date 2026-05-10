# Utilisation d'une image légère
FROM python:3.9-slim

# Installation des dépendances système nécessaires pour psycopg2 (PostgreSQL)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Définition du répertoire de travail
WORKDIR /app

# Installation des dépendances Python en tant que root pour garantir l'accès global
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sécurité : Création de l'utilisateur non-root
RUN useradd -m dit_user && chown -R dit_user:dit_user /app

# Copie du code source ET attribution de la propriété à l'utilisateur dit_user
COPY --chown=dit_user:dit_user . .

# Passage à l'utilisateur non-root pour l'exécution
USER dit_user

# Port pour le service Emprunt
EXPOSE 8000

# Lancement de l'application sur le port 8003
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]