"""Export brand logos as standalone SVG files into assets/logos/.

Full-color logos come from the svg-logos set (@iconify-json/logos); the few it lacks
fall back to Simple Icons (single brand color).

Usage: python scripts/build-logos.py <iconify-logos icons.json> <simple-icons data dir>
"""

import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "logos"

# Oracle only ships as a wordmark in both sets, so its "O" capsule is drawn by hand.
CUSTOM = {
    "oracle": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="6" y="17" width="52" height="30" rx="15" fill="none" stroke="#C74634" stroke-width="7"/></svg>',
}

# key: ("iconify", name) or ("si", slug)
LOGOS = {
    "typescript": ("iconify", "typescript-icon"),
    "javascript": ("iconify", "javascript"),
    "python": ("iconify", "python"),
    "java": ("iconify", "java"),
    "react": ("iconify", "react"),
    "expo": ("iconify", "expo-icon"),
    "angular": ("iconify", "angular-icon"),
    "vite": ("iconify", "vitejs"),
    "tailwind": ("iconify", "tailwindcss-icon"),
    "tanstack": ("iconify", "react-query-icon"),
    "nestjs": ("iconify", "nestjs"),
    "nodejs": ("iconify", "nodejs-icon"),
    "fastapi": ("iconify", "fastapi-icon"),
    "spring": ("iconify", "spring-icon"),
    "prisma": ("iconify", "prisma"),
    "sqlalchemy": ("si", "sqlalchemy"),
    "postgresql": ("iconify", "postgresql"),
    "sqlite": ("si", "sqlite"),
    "neon": ("iconify", "neon-icon"),
    "firebase": ("iconify", "firebase-icon"),
    "tensorflow": ("iconify", "tensorflow"),
    "keras": ("si", "keras"),
    "numpy": ("iconify", "numpy"),
    "pandas": ("iconify", "pandas-icon"),
    "scikitlearn": ("si", "scikitlearn"),
    "gemini": ("iconify", "google-gemini-icon"),
    "cohere": ("iconify", "cohere-icon"),
    "groq": ("iconify", "groq"),
    "docker": ("iconify", "docker-icon"),
    "githubactions": ("iconify", "github-actions"),
    "vercel": ("iconify", "vercel-icon"),
    "render": ("si", "render"),
    "cloudinary": ("iconify", "cloudinary-icon"),
    "linux": ("iconify", "linux-tux"),
    "git": ("iconify", "git-icon"),
    "jest": ("iconify", "jest"),
    "vitest": ("iconify", "vitest"),
    "playwright": ("iconify", "playwright"),
    "pytest": ("si", "pytest"),
    "zod": ("iconify", "zod"),
    "graphql": ("iconify", "graphql"),
    "pnpm": ("iconify", "pnpm"),
    "aws": ("iconify", "aws"),
    "google": ("iconify", "google-icon"),
    "googlecloud": ("iconify", "google-cloud"),
    "github": ("iconify", "github-icon"),
    "linkedin": ("iconify", "linkedin-icon"),
    "databricks": ("iconify", "databricks-icon"),
}


def main(iconify_json: str, si_dir: str) -> None:
    data = json.loads(Path(iconify_json).read_text())
    icons, aliases = data["icons"], data.get("aliases", {})
    dw, dh = data.get("width", 256), data.get("height", 256)
    si = {e["slug"]: e for e in json.loads((Path(si_dir) / "data" / "simple-icons.json").read_text())}
    OUT.mkdir(parents=True, exist_ok=True)
    for key, (src, name) in LOGOS.items():
        if src == "iconify":
            name = aliases.get(name, {}).get("parent", name)
            icon = icons[name]
            w, h = icon.get("width", dw), icon.get("height", dh)
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">{icon["body"]}</svg>'
        else:
            path = (Path(si_dir) / "icons" / f"{name}.svg").read_text()
            d = path.split(' d="', 1)[1].split('"', 1)[0]
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#{si[name]["hex"]}" d="{d}"/></svg>'
        (OUT / f"{key}.svg").write_text(svg)
    for key, svg in CUSTOM.items():
        (OUT / f"{key}.svg").write_text(svg)
    print(f"{len(LOGOS) + len(CUSTOM)} logos written to {OUT}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
