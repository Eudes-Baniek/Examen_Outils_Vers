import psycopg2
import os

# Configuration (variables d'environnement si présentes, sinon valeurs docker-compose locales)
DB_HOST = os.getenv("POSTGRES_HOST", os.getenv("DB_HOST", "localhost"))
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "library_db")
DB_USER = os.getenv("POSTGRES_USER", "dit_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "dit_password")


def seed_data():
    livres_a_inserer = [
        ("Le Seigneur des Anneaux", "J.R.R. Tolkien", "Fantasy", "978-2266280644"),
        ("I, Robot", "Isaac Asimov", "Science-Fiction", "978-0553294385"),
        ("Deep Learning", "Ian Goodfellow", "Technique", "978-0262035613"),
        ("Une brève histoire du temps", "Stephen Hawking", "Scientifique", "978-2226292953"),
        ("Alan Turing: L'énigme", "Andrew Hodges", "Biopic", "978-2246815016"),
        ("Le Meilleur des mondes", "Aldous Huxley", "Dystopie", "978-2070368228"),
    ]

    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
        )
        cur = conn.cursor()
        cur.executemany(
            "INSERT INTO livres (titre, auteur, categorie, isbn) VALUES (%s, %s, %s, %s)",
            livres_a_inserer,
        )

        conn.commit()
        print(f"{len(livres_a_inserer)} livres insérés avec succès !")

    except Exception as e:
        print(f"Erreur : {e}")
    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    seed_data()
