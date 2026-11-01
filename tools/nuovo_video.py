#!/usr/bin/env python3
"""Create videos/YYYY-MM-title/raw with the current date and print the prompt for Claude.

Usage: python3 tools/nuovo_video.py "Titolo del video"
"""
import argparse
import re
import unicodedata
from datetime import date
from pathlib import Path


def slug(title):
    ascii_title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_title.lower()).strip("-")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("titolo")
    title = slug(ap.parse_args().titolo)
    if not title:
        ap.error("il titolo deve contenere almeno una lettera o un numero")

    relative = f"videos/{date.today():%Y-%m}-{title}/raw"
    raw = Path(__file__).resolve().parent.parent / relative
    raw.mkdir(parents=True, exist_ok=True)

    print(f"Copia il girato in: {raw}\n")
    print("Poi apri Claude Code nella cartella del progetto e scrivi:\n")
    print(f"Monta il video in {relative} con freecut.")
    print("Segui CLAUDE.md, STYLE-GUIDE.md e lessons.md.")
    print("Proponimi il piano di montaggio e aspetta la mia approvazione.")


if __name__ == "__main__":
    main()
