#!/usr/bin/env python3
"""Build natural-phrase subtitles from a freecut edl.json and its cached transcripts.

Whisper stretches words over pauses, so each word goes to the range it overlaps most.
Corrections come from glossario.txt, one per line: wrong => right.

Usage: python3 tools/crea_sottotitoli.py <edl.json> -o <out.srt> [--max-chars 42]
"""
import argparse
import json
import re
from pathlib import Path

MIN_COMMA_CHARS = 20
MIN_SECONDS = 0.8
GLOSSARY = Path(__file__).resolve().parent.parent / "glossario.txt"
# Italian articles, prepositions and conjunctions read badly at the end of a line.
NO_BREAK_AFTER = set(
    "a ad al alla allo ai agli alle che con da dal dalla dai dalle dei del della delle di e ed "
    "gli i il in la le lo ma ne nel nella nei nelle o per se su sul sulla tra fra un una uno".split()
)


def norm(text):
    return re.sub(r"^\W+|\W+$", "", text).casefold()


def place_words(edl, edit_dir):
    """Return every kept word as [start, end, text] on the output timeline."""
    fps = edl.get("fps", 24)
    ranges = []
    offset = 0.0
    for r in edl["ranges"]:
        # render.py cuts whole frames, so offsets must follow the same grid.
        ranges.append((r["source"], r["start"], r["end"], offset))
        offset += round((r["end"] - r["start"]) * fps) / fps

    words = []
    for source in edl["sources"]:
        transcript = json.loads((edit_dir / "transcripts" / f"{source}.json").read_text())
        candidates = [r for r in ranges if r[0] == source]
        for w in transcript["words"]:
            if w["type"] != "word":
                continue
            overlap, best = max(
                ((min(w["end"], r[2]) - max(w["start"], r[1]), r) for r in candidates),
                key=lambda item: item[0],
                default=(0, None),
            )
            if overlap <= 0:
                continue
            _, start, end, at = best
            words.append(
                [max(w["start"], start) - start + at, min(w["end"], end) - start + at, w["text"].strip()]
            )
    return sorted(words)


def merge_apostrophes(words):
    """Whisper splits "all'interno" into "all" and "'interno"."""
    merged = []
    for word in words:
        if merged and word[2].startswith("'"):
            merged[-1][1] = word[1]
            merged[-1][2] += word[2]
        else:
            merged.append(word)
    return merged


def load_glossary():
    rules = []
    if GLOSSARY.exists():
        for line in GLOSSARY.read_text().splitlines():
            if "=>" in line and not line.startswith("#"):
                wrong, right = line.split("=>", 1)
                rules.append(([norm(t) for t in wrong.split()], right.strip()))
    return rules


def apply_glossary(words, rules):
    fixed = []
    i = 0
    while i < len(words):
        for wrong, right in rules:
            window = words[i : i + len(wrong)]
            if [norm(w[2]) for w in window] == wrong:
                trailing = re.search(r"\W*$", window[-1][2]).group()
                fixed.append([window[0][0], window[-1][1], right + trailing])
                i += len(wrong)
                break
        else:
            fixed.append(words[i])
            i += 1
    return fixed


def split_cues(words, max_chars):
    cues = []
    current = []
    for word in words:
        if current and len(" ".join(w[2] for w in current + [word])) > max_chars:
            carried = []
            while len(current) > 1 and norm(current[-1][2]) in NO_BREAK_AFTER:
                carried.insert(0, current.pop())
            cues.append(current)
            current = carried
        current.append(word)
        text = " ".join(w[2] for w in current)
        if text[-1] in ".!?" or (text[-1] in ",;:" and len(text) >= MIN_COMMA_CHARS):
            cues.append(current)
            current = []
    if current:
        cues.append(current)
    return cues


def timestamp(seconds):
    ms = round(seconds * 1000)
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def to_srt(cues):
    lines = []
    capitalize = True
    for i, cue in enumerate(cues):
        text = " ".join(w[2] for w in cue)
        if capitalize:
            text = text[0].upper() + text[1:]
        capitalize = text[-1] in ".!?"
        start = cue[0][0]
        end = max(cue[-1][1], start + MIN_SECONDS)
        if i + 1 < len(cues):
            end = min(end, cues[i + 1][0][0])
        lines += [str(i + 1), f"{timestamp(start)} --> {timestamp(end)}", text, ""]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("edl", type=Path)
    ap.add_argument("-o", "--output", type=Path, required=True)
    ap.add_argument("--max-chars", type=int, default=42)
    args = ap.parse_args()

    edl_path = args.edl.resolve()
    words = merge_apostrophes(place_words(json.loads(edl_path.read_text()), edl_path.parent))
    cues = split_cues(apply_glossary(words, load_glossary()), args.max_chars)
    args.output.write_text(to_srt(cues))
    print(f"{args.output}: {len(cues)} sottotitoli")


if __name__ == "__main__":
    main()
