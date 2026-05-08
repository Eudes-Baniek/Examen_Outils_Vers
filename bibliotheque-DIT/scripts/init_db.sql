-- Création des bases de données pour chaque microservice
CREATE DATABASE IF NOT EXISTS db_livres;
CREATE DATABASE IF NOT EXISTS db_utilisateurs;
CREATE DATABASE IF NOT EXISTS db_emprunts;

-- Droits pour l'utilisateur admin
GRANT ALL PRIVILEGES ON DATABASE db_livres TO admin;
GRANT ALL PRIVILEGES ON DATABASE db_utilisateurs TO admin;
GRANT ALL PRIVILEGES ON DATABASE db_emprunts TO admin;

