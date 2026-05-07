import psycopg2
import os

# Configuration (identique au docker-compose)
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "library_db"
DB_USER = "dit_user"
DB_PASS = "dit_password"


def seed_data():
    livres_a_inserer = [
        ("Le Seigneur des Anneaux", "J.R.R. Tolkien", "Fantasy"),
        ("I, Robot", "Isaac Asimov", "Science-Fiction"),
        ("Deep Learning", "Ian Goodfellow", "Technique"),
        ("Une brève histoire du temps", "Stephen Hawking", "Scientifique"),
        ("Alan Turing: L'énigme", "Andrew Hodges", "Biopic"),
        ("Le Meilleur des mondes", "Aldous Huxley", "Dystopie"),
    ]

    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cur = conn.cursor()

        # Insertion groupée
        cur.executemany(
            "INSERT INTO livres (titre, auteur, categorie) VALUES (%s, %s, %s)",
            livres_a_inserer,
        )

        conn.commit()
        print(f"{len(livres_a_inserer)} livres insérés avec succès !")

    except Exception as e:
        print(f"Erreur : {e}")
    finally:
        if "conn" in locals():
            cur.close()
            conn.close()


if __name__ == "__main__":
    seed_data()
