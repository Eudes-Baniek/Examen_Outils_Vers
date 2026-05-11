import subprocess
import sys
from pathlib import Path


def run_step(script_name: str) -> None:
    script_path = Path(__file__).with_name(script_name)
    subprocess.run([sys.executable, str(script_path)], check=True)


def main() -> int:
    run_step("preprocess.py")
    run_step("train.py")
    run_step("evaluate.py")
    print("Pipeline ML terminé : models/model.pkl et metrics.json mis à jour.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
