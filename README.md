# HEX — the colour quiz

How well do you **actually** see colour? A pile of small games, scored by **ΔE** —
the distance between two colours measured as vectors in
[CIELAB](https://en.wikipedia.org/wiki/CIELAB_color_space) space.

A colour is just a point in space. Convert a hex to Lab coordinates (a space built
so distance matches perception), take the straight-line distance — the norm of the
difference vector — between your guess and the target, and that number *is* your
error. Lower distance, higher score. The feedback screen even plots where the colour
sat versus your guess: a Lab a*b* plane with the two points joined by a line (that
line is the ΔE), a lightness bar, and per-channel RGB tracks.

**Live:** [hex-sable.vercel.app](https://hex-sable.vercel.app)

## How it plays

The landing page drops you straight into **the ultimate colour game** — every mode
shuffled together. Use the menu up top to pick a subset of modes (or just one); the
choice is saved to your browser. The explainer and a per-mode overview live at
[`/about`](https://hex-sable.vercel.app/about). Best scores save per-mode (and for
the ultimate mix) to `localStorage`.

## Game modes (13)

**Precision — scored by ΔE:**

| Mode | What you do |
|---|---|
| **guess the hex** | see a swatch, type the six-digit hex |
| **rgb match** | drag R / G / B sliders to match a colour |
| **spectrum** | drag across a hue × lightness field to find the colour |

**Multiple choice:**

| Mode | What you do |
|---|---|
| **closest** | pick the swatch nearest the target (smallest norm) |
| **exact match** | four near-identical swatches, one is pixel-perfect (easy/normal/hard) |
| **complement** | pick the colour 180° opposite on the wheel |
| **odd one out** | spot the swatch furthest from the other three |
| **colour mix** | pick the blend (midpoint) of two swatches |
| **warmest** | pick the warmest colour (most red over blue) |
| **hex → colour** | read a hex code, pick the swatch it makes |
| **name that colour** | match a swatch to its name |
| **flag colours** | guess the country from its flag's palette |
| **brand colours** | guess the brand from its official colours |

Each game is 12 rounds. A streak builds as you keep hitting; the results screen shows
accuracy, best streak and a per-round sparkline.

## Architecture

One shared **game engine** (`components/game/game-engine.tsx`) owns the loop, score
and results, and draws each round from the pool of enabled modes. Every mode is a
standardized single-round component implementing `RoundProps` and rendering into a
shared `RoundLayout` (stage on the left, feedback on the right — so a round and its
result fit on screen without scrolling). Colour maths lives in
[`lib/color.ts`](lib/color.ts).

## Stack

- **Next.js 15** (App Router), every page statically generated
- **Tailwind CSS 3** — the design tokens / "one teal accent" look from `BLUEPRINT.md`
- **lucide-react** icons · **next-themes** light/dark/system
- No backend, no database, no tracking.

## Data & generators

Static data lives in [`data/`](data/), with two generators (run locally, output is
committed):

```bash
npm run gen:flags    # extracts dominant palettes from every flagcdn flag (pngjs)  -> data/flags.ts  (~250)
npm run gen:brands   # curated core + brand colours from simple-icons              -> data/brands.ts (~150)
```

Named colours are curated in `data/colors.ts`. Flag thumbnails (shown only on the
answer reveal) come from [flagcdn.com](https://flagcdn.com); brand colours are public
brand-guideline values used purely as swatches — no logos.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (static)
npm start        # serve the build
```

## Deploy

Zero-config on Vercel and connected to this repo, so pushes to `main` auto-deploy.
Manual: `npx vercel --prod`.

---

*Built on the aesthetic in `BLUEPRINT.md`: off-white canvas, one teal accent,
hairline-bordered rounded cards, monospaced numbers, lowercase labels.*
