#!/usr/bin/env python3
"""Convert a freecut edl.json into an FCPXML timeline for DaVinci Resolve.

Track 1 holds the cuts on the original files; overlays go on the track above.
Frame rate comes from the EDL, frame size from the first source (rotation included).
Grade, audio fades and loudness are not carried over: import subtitles separately.

Usage: python3 tools/edl_to_fcpxml.py <edl.json> -o <out.fcpxml>
"""
import argparse
import json
import subprocess
from fractions import Fraction
from pathlib import Path
from xml.etree import ElementTree as ET


def frames(seconds, fps):
    """Round to a whole frame, so every cut lands on the timeline grid."""
    return round(Fraction(seconds).limit_denominator(100000) * fps)


def rational(n_frames, fps):
    t = Fraction(n_frames, fps)
    return f"{t.numerator}s" if t.denominator == 1 else f"{t.numerator}/{t.denominator}s"


def resolve(path, base):
    p = Path(path)
    return p if p.is_absolute() else (base / p).resolve()


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    info = json.loads(out.stdout)
    video = next(s for s in info["streams"] if s["codec_type"] == "video")
    width, height = video["width"], video["height"]
    rotation = next(
        (s["rotation"] for s in video.get("side_data_list", []) if "rotation" in s), 0
    )
    if int(rotation) % 180:
        width, height = height, width
    return {
        "width": width,
        "height": height,
        "duration": float(info["format"]["duration"]),
        "audio": any(s["codec_type"] == "audio" for s in info["streams"]),
    }


def convert(edl, base, fps):
    sources = {name: resolve(path, base) for name, path in edl["sources"].items()}
    first = probe(next(iter(sources.values())))

    root = ET.Element("fcpxml", version="1.9")
    resources = ET.SubElement(root, "resources")
    ET.SubElement(
        resources, "format", id="r0", frameDuration=f"1/{fps}s",
        width=str(first["width"]), height=str(first["height"]),
    )

    assets = {}

    def asset(key, path):
        info = probe(path)
        assets[key] = f"r{len(assets) + 1}"
        el = ET.SubElement(
            resources, "asset", id=assets[key], name=path.stem, start="0s",
            duration=rational(frames(info["duration"], fps), fps), hasVideo="1", format="r0",
        )
        if info["audio"]:
            el.set("hasAudio", "1")
            el.set("audioSources", "1")
        ET.SubElement(el, "media-rep", kind="original-media", src=path.as_uri())
        return assets[key]

    for name, path in sources.items():
        asset(name, path)

    spans = []
    offset = 0
    for r in edl["ranges"]:
        start = frames(r["start"], fps)
        length = frames(r["end"], fps) - start
        if length <= 0:
            raise ValueError(f"empty range: {r}")
        spans.append((r["source"], start, offset, length))
        offset += length

    event = ET.SubElement(ET.SubElement(root, "library"), "event", name="freecut")
    project = ET.SubElement(event, "project", name="freecut")
    sequence = ET.SubElement(
        project, "sequence", format="r0", duration=rational(offset, fps),
        tcStart="0s", tcFormat="NDF",
    )
    spine = ET.SubElement(sequence, "spine")

    clips = []
    for source, start, at, length in spans:
        clips.append((at, length, ET.SubElement(
            spine, "asset-clip", ref=assets[source], name=source,
            offset=rational(at, fps), start=rational(start, fps),
            duration=rational(length, fps), format="r0",
        ), start))

    # Connected clips are timed against their parent's source timecode.
    for i, ov in enumerate(edl.get("overlays") or []):
        path = resolve(ov["file"], base)
        at = frames(ov["start_in_output"], fps)
        length = frames(ov["duration"], fps)
        parent = next((c for c in clips if c[0] <= at < c[0] + c[1]), None)
        if parent is None:
            raise ValueError(f"overlay outside the timeline: {ov}")
        ET.SubElement(
            parent[2], "asset-clip", ref=asset(f"overlay{i}", path), name=path.stem,
            lane="1", offset=rational(at - parent[0] + parent[3], fps), start="0s",
            duration=rational(length, fps), format="r0",
        )

    return root


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("edl", type=Path)
    ap.add_argument("-o", "--output", type=Path, required=True)
    args = ap.parse_args()

    edl_path = args.edl.resolve()
    edl = json.loads(edl_path.read_text())
    root = convert(edl, edl_path.parent, edl.get("fps", 24))
    ET.indent(root)
    body = ET.tostring(root, encoding="unicode")
    args.output.write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE fcpxml>\n{body}\n')
    print(f"{args.output}: {len(root.findall('.//spine/asset-clip'))} cuts")


if __name__ == "__main__":
    main()
