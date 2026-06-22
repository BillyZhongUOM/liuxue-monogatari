#!/usr/bin/env python3
"""Knock out a UNIFORM solid background by flood-filling from the four corners.

Some generated sprites ignore the magenta screen and come back on a flat neutral
(beige/grey) background that the magenta chroma key cannot touch. This does a
tolerance-bounded flood fill seeded from the corners: it removes the connected
background region and stops at the building's darker outline, so it does not
over-eat the object the way a global colour match would.

Only acts when the corners are actually opaque (so it is safe to run on every
sprite: already-transparent ones are left alone). A light edge despill softens
the fringe left where the fill meets the object.

Usage: knockout-flood.py file ...
"""
import sys
from collections import deque
from PIL import Image

TOL = 50          # max RGB channel-sum distance from the seed to count as background
EDGE_DESPILL = 28 # near-background fringe pixels get alpha trimmed


def corner_opaque(px, w, h):
    # >5 so a faint leftover haze (alpha ~10) still seeds the fill, while a clean
    # corner (alpha 0) is left alone.
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)]
    op = [px[x, y] for (x, y) in pts if px[x, y][3] > 5]
    return op


def knock(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    op = corner_opaque(px, w, h)
    if len(op) < 2:
        return 0  # corners already transparent -> nothing solid to remove

    # seed colour = average of the opaque corners
    sr = sum(c[0] for c in op) // len(op)
    sg = sum(c[1] for c in op) // len(op)
    sb = sum(c[2] for c in op) // len(op)

    def dist(c):
        return abs(c[0] - sr) + abs(c[1] - sg) + abs(c[2] - sb)

    seen = bytearray(w * h)
    q = deque()
    for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        q.append((x, y))
    cleared = 0
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        c = px[x, y]
        if c[3] == 0:
            # already transparent: keep crossing it so the fill spans cleared gaps
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
            continue
        if dist(c) <= TOL:
            px[x, y] = (c[0], c[1], c[2], 0)
            cleared += 1
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
        elif dist(c) <= TOL + EDGE_DESPILL:
            # fringe pixel touching the background: half-trim its alpha
            px[x, y] = (c[0], c[1], c[2], c[3] // 2)
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    im.save(path)
    return cleared


if __name__ == "__main__":
    for p in sys.argv[1:]:
        n = knock(p)
        print(f"{p}: cleared {n}")
