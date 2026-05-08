# ── Stage 1 : build des dépendances ──────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ── Stage 2 : image finale légère ────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

RUN adduser --disabled-password --gecos '' appuser

# Copier uniquement les packages installés
COPY --from=builder /root/.local /root/.local

COPY . .

RUN mkdir -p /app/models /app/data && \
    chown -R appuser:appuser /app

USER appuser
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8004

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8004", "--reload"]
