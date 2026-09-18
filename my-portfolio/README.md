# My Portfolio

A hand-built portfolio website for **Dagiyosi**, a web developer. It is plain HTML, CSS and JavaScript
with **no frameworks, no bundler and no build step** - the folder you are reading is exactly what ships.

Live site: **https://dagiyosi-pixel.github.io/dagiyosi-pixel/**

## Files

| File | What it is |
| :-- | :-- |
| `index.html` | The whole page: semantic sections, SEO meta tags, Open Graph, JSON-LD and inline SVG icons |
| `styles.css` | Design tokens, dark and light themes, layout, animations and responsive breakpoints |
| `script.js` | Theme switching, mobile nav, scroll reveal, typing headline, counters, scroll progress, copy-to-clipboard |

## How it is published

`.github/workflows/deploy-portfolio.yml` publishes **this folder** to GitHub Pages using GitHub Actions:

1. On every push to `main` that touches `my-portfolio/**`, the workflow runs.
2. The folder is uploaded as a Pages artifact.
3. `actions/deploy-pages` publishes it at `https://dagiyosi-pixel.github.io/dagiyosi-pixel/`.

GitHub Pages only allows the repository root or a `/docs` folder when deploying from a branch, which is
why this site uses the Actions route - it keeps the `my-portfolio` folder name intact.

## Preview it locally

No tooling required. Open `index.html` directly in a browser, or serve the folder if you prefer:

```bash
# from the repository root
npx serve my-portfolio
```

## Editing guide

- **Colours and spacing** - change the custom properties at the top of `styles.css` (`:root` for dark and
  `[data-theme='light']` for light). Everything else inherits from those tokens.
- **Copy and content** - sections are marked with `<!-- MARK:... -->` free comments in `index.html`; edit the
  text directly, no templating involved.
- **Skill levels** - each bar is `<li style="--level:85%">`; change the percentage and the bar width follows.
- **Adding a project** - copy an `article.work-card` block. Use `badge-live` for something that is deployed
  and `badge-wip` for anything still in progress.
- **Contact details** - the email appears in the contact card, the footer and the JSON-LD block in the head.

## Accessibility and quality notes

- Skip link, visible focus rings, real `aria-expanded` state on the mobile menu and a live region for the
  copy-to-clipboard feedback.
- `prefers-reduced-motion` is respected: animations, the typing effect and the counters all stop.
- Every image has `alt` text and explicit dimensions; the layout holds from 320px upwards.
- Without JavaScript, all content is still visible - only the animations and theme switch are lost.
