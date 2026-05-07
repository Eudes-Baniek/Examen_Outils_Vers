import argparse
import json
import pickle
import pandas as pd


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="in_path", required=True)
    parser.add_argument("--model", dest="model_path", required=True)
    parser.add_argument("--out", dest="out_path", required=True)
    args = parser.parse_args()

    df = pd.read_csv(args.in_path)
    with open(args.model_path, "rb") as f:
        _model = pickle.load(f)

    # Placeholder minimal: métriques factices mais structurées.
    metrics = {
        "rmse": None,
        "mae": None,
        "rows": int(df.shape[0]),
    }

    with open(args.out_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
