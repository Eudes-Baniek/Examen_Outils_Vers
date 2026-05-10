# services-loans/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import csv
from fastapi import FastAPI

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

db_loans = []

@app.post("/loans")
async def make_loan(loan: dict):
    # loan contient {user_id: int, book_id: int}
    loan["date_emprunt"] = datetime.now().isoformat()
    db_loans.append(loan)
    return {"status": "success", "loan": loan}

@app.get("/loans/history")
async def get_history():
    return db_loans


@app.get("/loans/export")
async def export_loans():
    # Simulation d'export depuis ta DB PostgreSQL/MySQL
    # Le but est de créer le fichier que DVC va ensuite traiter
    output_path = "../data/loans.csv"
    
    # On récupère les données de la base (exemple simplifié)
    loans_data = [
        {"user_id": 1, "book_id": 101},
        {"user_id": 2, "book_id": 102},
        {"user_id": 1, "book_id": 103}
    ]
    
    with open(output_path, mode='w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["user_id", "book_id"])
        writer.writeheader()
        writer.writerows(loans_data)
        
    return {"status": "success", "message": f"Exporté vers {output_path}"}