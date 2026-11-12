# keylorpineda.dev

Personal portfolio of Keylor Pineda, built with [Astro](https://astro.build). Static output, no client framework: the interactions are one small TypeScript file.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where things live

| Path | What it holds |
| :-- | :-- |
| `src/data/content.ts` | Every text in English and Spanish, plus projects, tools and links |
| `src/components/Home.astro` | The page: hero, statement, work, stack, certifications, activity, contact |
| `src/components/Project.astro` | One project: header, pinned scroll scene, metrics, links |
| `src/components/Shot.astro` | A screenshot, with its light and dark variant |
| `src/styles/global.css` | All styles and the two themes |
| `src/scripts/app.ts` | Theme, language switch, scroll scenes, dock, command palette |
| `public/img/shots/` | Captures of the live demos, per language and theme |

## How it behaves

- **Languages.** English at `/`, Spanish at `/es/`. Both are real pages; switching fetches the other one and rewrites the texts in place, so nothing reloads. A first-time visitor with a Spanish browser is sent to `/es/`.
- **Theme.** Light and dark, following the system until the visitor chooses. The change spreads from the button using the View Transitions API and falls back to an instant switch.
- **Scroll scenes.** The hero, the statement and each project are tall blocks with a pinned screen. The script turns the scroll position into two CSS variables (`--e`, `--p`) and the styles do the rest.
- **Navigation.** A dock at the bottom on every screen size, and a command palette on Ctrl/Cmd + K.
- **Reduced motion and no JavaScript** are both handled: the content is plain, readable HTML either way.

## Screenshots

The captures in `public/img/shots/` were taken from the live Booth and Research Engine demos at 1440×900. The page shows the English set in both languages; change `shotLang` in `src/components/Shot.astro` to follow the page language instead.
