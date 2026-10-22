"""Generate the topographic background (assets/img/topo.svg).

A height field made of a few ridges and layered noise, traced into contour lines with
marching squares. Every fifth line is an index contour, drawn thicker, as on real
topographic maps. The SVG is used as a CSS mask, so its stroke colour does not matter.

Usage: python scripts/build-topo.py   (needs numpy and scikit-image)
"""

from pathlib import Path

import numpy as np
from skimage.measure import approximate_polygon, find_contours

W, H = 1600, 1000
SCALE = 5  # grid cell size in px
SEED = 506  # Costa Rica's calling code
LEVELS = 34
OUT = Path(__file__).resolve().parent.parent / "assets" / "img" / "topo.svg"


def value_noise(rng: np.random.Generator, shape: tuple[int, int], cells: int) -> np.ndarray:
    gh, gw = shape
    grid = rng.random((cells + 2, cells + 2))
    ys = np.linspace(0, cells, gh)
    xs = np.linspace(0, cells, gw)
    y0, x0 = np.floor(ys).astype(int), np.floor(xs).astype(int)
    ty, tx = ys - y0, xs - x0
    ty, tx = ty * ty * (3 - 2 * ty), tx * tx * (3 - 2 * tx)
    a = grid[np.ix_(y0, x0)]
    b = grid[np.ix_(y0, x0 + 1)]
    c = grid[np.ix_(y0 + 1, x0)]
    d = grid[np.ix_(y0 + 1, x0 + 1)]
    top = a + (b - a) * tx[None, :]
    bottom = c + (d - c) * tx[None, :]
    return top + (bottom - top) * ty[:, None]


def height_field() -> np.ndarray:
    rng = np.random.default_rng(SEED)
    gh, gw = H // SCALE + 1, W // SCALE + 1
    yy, xx = np.mgrid[0:gh, 0:gw]
    z = np.zeros((gh, gw))
    # A few volcano-like peaks, like the Central Valley skyline.
    for cx, cy, r, h in [(0.18, 0.30, 0.22, 1.0), (0.62, 0.18, 0.18, 0.8), (0.84, 0.70, 0.26, 1.1), (0.38, 0.82, 0.16, 0.6)]:
        d2 = ((xx / gw - cx) * 1.6) ** 2 + (yy / gh - cy) ** 2
        z += h * np.exp(-d2 / (2 * r * r))
    for cells, amp in [(4, 0.55), (9, 0.25), (18, 0.10), (36, 0.04)]:
        z += amp * value_noise(rng, (gh, gw), cells)
    return z


def main() -> None:
    z = height_field()
    levels = np.linspace(z.min(), z.max(), LEVELS + 2)[1:-1]
    paths_thin, paths_index = [], []
    for i, level in enumerate(levels):
        for contour in find_contours(z, level):
            if len(contour) < 8:
                continue
            pts = approximate_polygon(contour * SCALE, tolerance=0.9)
            d = "M" + " ".join(f"{x:.0f} {y:.0f}" for y, x in pts)
            (paths_index if i % 5 == 0 else paths_thin).append(d)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">'
        f'<g fill="none" stroke="#000" stroke-linejoin="round" stroke-linecap="round">'
        f'<path stroke-width="1" d="{" ".join(paths_thin)}"/>'
        f'<path stroke-width="2.2" d="{" ".join(paths_index)}"/>'
        "</g></svg>"
    )
    OUT.write_text(svg)
    print(f"{OUT.name}: {len(svg) / 1024:.0f} KB, {len(paths_thin) + len(paths_index)} contours")


if __name__ == "__main__":
    main()
