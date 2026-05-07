import argparse
import pickle
import pandas as pd


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="in_path", required=True)
    parser.add_argument("--out", dest="out_path", required=True)
    args = parser.parse_args()

    df = pd.read_csv(args.in_path)

    # Placeholder minimal: on stocke des stats basiques.
    # Le vrai modèle (SVD/KNN) sera implémenté dans une itération suivante.
    model = {
        "rows": int(df.shape[0]),
        "columns": [str(c) for c in df.columns],
    }

    with open(args.out_path, "wb") as f:
        pickle.dump(model, f)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
