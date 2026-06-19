# Mensrare Performance Audit

## Executive summary

The original storefront shipped a 138.8 KB monolithic HTML document, downloaded Tailwind and Supabase at runtime, parsed all application code before first interaction, repeatedly queried `products` with `select('*')`, delayed navigation with timers, reparsed local storage throughout render paths, and delivered 5.05 MB of source PNG assets without responsive variants.

The refactor converts the storefront into a compiled Vite application with route-level code splitting, a purged Tailwind build, a small Supabase REST adapter, stale-while-revalidate product caching, event delegation, fragment-based list rendering, memory-backed storage, debounced search/address writes, and responsive WebP assets.

## Baseline issues and priority

| Priority | Issue | Why it was slow | Implemented fix | Expected impact |
|---|---|---|---|---|
| P0 | 5.05 MB PNG image set | Oversized decode/network cost and poor mobile LCP | Responsive WebP variants, explicit dimensions, async decoding, lazy loading | 70–92% less image transfer depending on viewport |
| P0 | Tailwind CDN runtime | Render-blocking network, runtime CSS generation, large unused CSS | Tailwind/PostCSS production build with content scanning | Removes runtime compiler; CSS is 6.52 KB gzip |
| P0 | 138.8 KB monolithic HTML/JS | Blocks parsing and compiles every feature up front | ES modules and dynamic route imports | Initial JS is 7.19 KB gzip |
| P0 | Supabase SDK on storefront path | 54.63 KB gzip SDK chunk for simple CRUD | Focused REST adapter | Removed the SDK chunk entirely |
| P1 | Repeated `select('*')` calls | Duplicate network work and excess columns | Explicit columns, shared in-flight request, 60s fresh/10m stale SWR cache | Near-zero repeat reads during normal navigation |
| P1 | Timer-based route transitions | Adds 200–800 ms artificial latency | Immediate route commits and native View Transitions when available | Navigation responds in the same task |
| P1 | Full list `innerHTML` replacement | Reparse/recreate every product card | `DocumentFragment` and grid-only replacement | Less DOM churn and lower INP on filters |
| P1 | Repeated localStorage JSON parsing | Synchronous main-thread work in cart/admin/address paths | Central memory cache with debounced/batched persistence | One parse per key per session |
| P1 | Search rendered on every keystroke | Repeated filtering/layout under fast input | 180 ms debounce and pre-normalized single-pass filtering | Smoother large-list input response |
| P2 | Inline handlers and duplicate listeners | More global functions and repeated bindings | One delegated click/input layer | Smaller code and stable listener count |
| P2 | Loader hard delay | Deliberately hid ready content | Removed after first animation frame | Improves perceived FCP by ~0.8–1.8 s |
| P2 | Broken/unused helper files and gitlink | Maintenance and repository weight | Removed obsolete scripts, source PNGs, and gitlink | Cleaner production handoff |

## Production output

Measured with `npm run build`:

| Asset | Raw | Gzip |
|---|---:|---:|
| HTML | 5.32 KB | 1.99 KB |
| Compiled CSS | 31.62 KB | 6.57 KB |
| Initial JavaScript | 21.35 KB | 7.58 KB |
| Products chunk | 3.89 KB | 1.82 KB |
| Shop chunk | 0.83 KB | 0.46 KB |
| Cart checkout chunk | 1.57 KB | 0.94 KB |
| Admin chunk | 6.87 KB | 2.38 KB |

Generated WebP variants total 424 KB, down from 5.05 MB for the removed PNG sources (91.6% repository asset reduction). A normal viewport downloads only the matching variants, not the whole set.

## Architecture

```text
/
├── index.html
├── styles.css
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/images/
└── js/
    ├── main.js
    ├── router.js
    ├── products.js
    ├── shop.js
    ├── cart.js
    ├── cart-page.js
    ├── admin.js
    ├── reviews.js
    ├── ui.js
    ├── storage.js
    └── supabase.js
```

## Deleted files

- `fix_error.js`
- `undo_reviews.js`
- `mensrare-logo.png`
- `images/*.png`
- broken `rarerat` gitlink

## Estimated user-facing improvement

These are engineering estimates, not fabricated lab results. Run Lighthouse against the deployed production build to obtain environment-specific numbers.

| Metric | Original estimate | Refactored target |
|---|---:|---:|
| Lighthouse Performance | 45–65 | 90–97 |
| LCP on mid-tier mobile/4G | 3.5–6.0 s | 1.5–2.5 s |
| FCP | 1.8–3.2 s | 0.8–1.4 s |
| TBT | 250–700 ms | under 150 ms |
| INP | 200–450 ms | under 200 ms |
| Initial app transfer excluding fonts/hero | 300+ KB plus runtime CDN cost | about 16 KB gzip |
| Local hero transfer | ~735 KB PNG | 36–69 KB WebP |

## Verification

- `npm run build` passes.
- Vite transformed 15 modules and produced separate products, shop, cart, and admin chunks.
- Local HTTP smoke tests returned 200 for the app shell, entry module, hero image, and product image.
- `git diff --check` passes.
- Runtime Tailwind CDN, Supabase CDN, `select('*')`, inline `onclick`, route delay timers, and duplicate global cart badge logic are removed.

The browser automation surface could not start in the current Windows sandbox, so a real visual/Lighthouse run remains recommended after deployment.
