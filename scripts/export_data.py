import psycopg2
import json


def export_to_json():
    try:
        # Connexion à la base de données Docker
        conn = psycopg2.connect(
            host="localhost",
            port="5433",  # Le port exposé dans ton docker-compose
            database="bibliotheque_db",
            user="user",
            password="password",
        )
        cur = conn.cursor()

        # Extraction des livres
        cur.execute("SELECT * FROM livres")
        rows = cur.fetchall()

        # Transformation en format dictionnaire
        livres = []
        for row in rows:
            livres.append(
                {
                    "id": row[0],
                    "titre": row[1],
                    "auteur": row[2],
                    "categorie": row[3],
                }
            )

        # Sauvegarde en JSON
        with open("data_export.json", "w", encoding="utf-8") as f:
            json.dump(livres, f, indent=4, ensure_ascii=False)

        print("✅ Exportation réussie : data_export.json créé.")

    except Exception as e:
        print(f"❌ Erreur lors de l'export : {e}")
    finally:
        if conn:
            cur.close()
            conn.close()


if __name__ == "__main__":
    export_to_json()
