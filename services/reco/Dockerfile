# Stage 1: Build
FROM python:3.9-slim

# On reste en root pour l'installation
WORKDIR /app

# Installation des dépendances (en root pour garantir l'accès global)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sécurité : Créer l'utilisateur pour l'exécution
RUN useradd -m dit_user && chown -R dit_user:dit_user /app

# Copier le code ET donner la propriété à l'utilisateur DIT
COPY --chown=dit_user:dit_user . .

# Basculer sur l'utilisateur pour l'exécution (Exigence Examen)
USER dit_user

# Port (8003 pour emprunt ou 8004 pour reco)
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]