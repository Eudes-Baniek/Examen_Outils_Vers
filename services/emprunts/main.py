# services-loans/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import csv
import os

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


@app.get("/loans/user/{user_id}")
async def get_user_history(user_id: int):
    return [loan for loan in db_loans if loan.get("user_id") == user_id]


@app.get("/loans/export")
async def export_loans():
    output_path = os.getenv("LOANS_EXPORT_PATH", "/data/loans.csv")
    loans_data = [
        {"user_id": loan["user_id"], "book_id": loan["book_id"]}
        for loan in db_loans
    ]
    if not loans_data:
        raise HTTPException(status_code=400, detail="Aucun emprunt à exporter.")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, mode="w", newline="", encoding="utf-8") as export_file:
        writer = csv.DictWriter(export_file, fieldnames=["user_id", "book_id"])
        writer.writeheader()
        writer.writerows(loans_data)

    return {"status": "success", "message": f"Exporté vers {output_path}", "rows": len(loans_data)}