INSERT INTO livres (
    titre,
    auteur,
    isbn,
    description,
    genre,
    annee_publication,
    editeur,
    quantite_totale,
    quantite_disponible,
    date_ajout,
    date_modification
)
VALUES
(
    'Clean Code',
    'Robert C. Martin',
    'ISBN001',
    'Livre sur les bonnes pratiques de développement',
    'informatique',
    2008,
    'Prentice Hall',
    5,
    5,
    NOW(),
    NOW()
),
(
    'Design Patterns',
    'Erich Gamma',
    'ISBN002',
    'Les patterns de conception orientée objet',
    'informatique',
    1994,
    'Addison-Wesley',
    3,
    3,
    NOW(),
    NOW()
),
(
    'Introduction to Algorithms',
    'Thomas H. Cormen',
    'ISBN003',
    'Livre de référence sur les algorithmes',
    'informatique',
    2009,
    'MIT Press',
    4,
    4,
    NOW(),
    NOW()
);