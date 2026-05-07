import argparse
import pandas as pd


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="in_path", required=True)
    parser.add_argument("--out", dest="out_path", required=True)
    args = parser.parse_args()

    df = pd.read_csv(args.in_path)

    # Nettoyage minimal: supprimer lignes incomplètes et normaliser les types.
    required_cols = [c for c in ["user_id", "book_id"] if c in df.columns]
    if required_cols:
        df = df.dropna(subset=required_cols)

    df.to_csv(args.out_path, index=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
