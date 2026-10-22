# keylorpineda.dev

Personal portfolio of Keylor Pineda, software developer from Costa Rica.

Plain HTML, CSS and JavaScript, no framework and no build step:

- Split-flap hero board, scroll-driven project stories that swap real screenshots, and a circular theme transition (View Transitions API).
- Light and dark themes, English and Spanish, and full support for `prefers-reduced-motion`.
- Brand logos exported from [svg-logos](https://github.com/gilbarbara/logos) and [Simple Icons](https://simpleicons.org) with `scripts/build-logos.py`.
- The activity cards are generated daily in [keylorpineda/keylorpineda](https://github.com/keylorpineda/keylorpineda).

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy

Hosted on Vercel as a static site (`vercel.json` sets caching and security headers).
