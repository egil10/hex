# HEX — the colour quiz

How well do you **actually** see colour? Eight little games that test it, all
scored by **ΔE** — the distance between two colours measured as vectors in
[CIELAB](https://en.wikipedia.org/wiki/CIELAB_color_space) space.

A colour is just a point in space. Convert a hex to Lab coordinates (a space
built so distance matches perception), take the straight-line distance — the
norm of the difference vector — between your guess and the target, and that
number *is* your error. Lower distance, higher score.

## Game modes

| Mode | What you do | Scoring |
|---|---|---|
| **guess the hex** | see a swatch, type the six-digit hex | ΔE |
| **rgb match** | drag R / G / B sliders to match a colour | ΔE |
| **spectrum** | click a hue × lightness field to find the colour | ΔE |
| **closest** | pick the swatch nearest the target (smallest norm) | ✓ / ✗ |
| **hex → colour** | read a hex code, pick the swatch it makes | ✓ / ✗ |
| **name that colour** | match a swatch to its name | ✓ / ✗ |
| **flag colours** | guess the country from its flag's palette | ✓ / ✗ |
| **brand colours** | guess the brand from its official colours | ✓ / ✗ |

Each game is 8–10 rounds; best scores are saved per-mode to your browser. A
streak builds as you keep hitting, and the results screen shows accuracy, best
streak and a per-round sparkline.

## Stack

- **Next.js 15** (App Router) — every page statically generated
- **Tailwind CSS 3** — the design tokens and "one teal accent" look from `BLUEPRINT.md`
- **lucide-react** icons · **next-themes** light/dark/system
- No backend, no database, no tracking. Colour science lives in [`lib/color.ts`](lib/color.ts).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (static)
npm start        # serve the build
```

## Deploy (Vercel)

The repo is zero-config for Vercel. Either:

1. Import `github.com/egil10/hex` at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected, just hit **Deploy**, or
2. From this folder, run `npx vercel` (first run links/logs in) then `npx vercel --prod`.

## Data & credits

- Named colours, flag palettes and brand palettes are curated static data in [`data/`](data/).
- Flag thumbnails (shown only on the answer reveal) come from [flagcdn.com](https://flagcdn.com).
- Brand colours are public brand-guideline values, used purely as swatches — no logos.

---

*Built on the aesthetic in `BLUEPRINT.md`: off-white canvas, one teal accent,
hairline-bordered rounded cards, monospaced numbers, lowercase labels.*
