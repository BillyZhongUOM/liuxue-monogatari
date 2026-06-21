#!/usr/bin/env python3
"""Chroma-key a flat magenta (#FF00FF) background to transparent.
The sprites are generated on a solid magenta screen; magenta never appears in
the buildings/character, so a global threshold keys cleanly with no over-eating.
A light despill neutralises the pink fringe on object edges.
Usage: knockout-bg.py file ...
"""
import sys
from PIL import Image


def key(path):
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    cleared = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            mag = (r + b) // 2 - g  # how magenta the pixel is
            if r > 140 and b > 140 and mag > 70:
                px[x, y] = (r, g, b, 0)  # background -> transparent
                cleared += 1
            elif mag > 38 and r > 110 and b > 110:
                ng = min(255, (r + b) // 2)  # fringe -> despill toward neutral
                px[x, y] = ((r + ng) // 2, ng, (b + ng) // 2, a)
    im.save(path)
    return cleared


for p in sys.argv[1:]:
    try:
        print(f"{p.split('/')[-1]}: cleared={key(p)}")
    except Exception as e:  # noqa
        print(f"{p}: FAILED {e}")
