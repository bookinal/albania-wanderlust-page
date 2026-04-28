# Theme Context

This file captures the main visual language used across the Bookinal web application so future UI work stays consistent with the existing product.

## Core Theme Structure

- Theme mode system: `apps/web/src/context/ThemeContext.tsx`
- Global design tokens: `apps/web/src/index.css`
- Tailwind token mapping: `tailwind.config.ts`
- Theme mode behavior:
  - supported modes: `dark`, `light`, and `blue`
  - persisted key: `alb-theme`
  - default mode: `dark`

## Theme Architecture Update

The app is no longer only a dark/light system.

- `ThemeContext` now cycles `dark -> light -> blue -> dark`
- `dark` still uses the `dark` class on the document root
- `blue` is applied with `data-theme="blue"`
- this gives the project two theming layers:
  - CSS-variable theme tokens from `apps/web/src/index.css`
  - local TypeScript token helpers for feature areas

New shared token helpers introduced during cleanup:

- homepage tokens: `apps/web/src/components/home/homeTheme.ts`
- search results tokens: `apps/web/src/pages/home/SearchPropertyResults/searchResultsTheme.ts`
- booking flow tokens: `apps/web/src/pages/home/booking/bookingTheme.ts`

## Brand Direction

The UI leans into an Albania-inspired travel aesthetic built around:

- Albanian red as the primary brand signal
- Adriatic / coastal blue as the supporting brand color
- warm stone and parchment neutrals for light mode
- charcoal / ink backgrounds for dark mode
- editorial typography on customer-facing surfaces
- softer utility styling on admin/dashboard surfaces

The product is not a flat SaaS blue-gray UI. Its strongest identity comes from the red accent, warm neutrals, and serif/display typography used in discovery and booking surfaces.

## Primary Color System

### CSS token palette

Defined in `apps/web/src/index.css`.

- `--primary`: Albanian red
  - light: `hsl(0 78% 52%)`
  - dark: `hsl(0 78% 60%)`
- `--secondary`: Adriatic blue
  - light: `hsl(200 68% 38%)`
  - dark: `hsl(200 68% 45%)`
- `--accent`: turquoise
  - light: `hsl(177 56% 45%)`
  - dark: `hsl(177 56% 50%)`

### Blue theme CSS palette

Also defined in `apps/web/src/index.css` under `:root[data-theme="blue"]`.

- `--background`: `hsl(205 55% 96%)`
- `--foreground`: `hsl(212 48% 18%)`
- `--primary`: `hsl(204 78% 44%)`
- `--secondary`: `hsl(199 72% 52%)`
- `--accent`: `hsl(191 74% 45%)`
- `--muted`: `hsl(205 45% 92%)`
- `--muted-foreground`: `hsl(211 22% 42%)`
- `--border`: `hsl(205 32% 84%)`
- extra semantic brand colors:
  - `--adriatic`: `hsl(200 68% 38%)`
  - `--turquoise`: `hsl(177 56% 45%)`
  - `--olive`: `hsl(85 30% 45%)`
  - `--terracotta`: `hsl(15 68% 58%)`
  - `--stone`: `hsl(40 15% 85%)`
  - `--mountain`: `hsl(210 25% 30%)`

### Frequently used hard-coded brand accents

Across the UI, the most repeated accent is:

- `#E8192C` / `#e41e20`: strong Bookinal red

Often used for:

- active states
- CTA buttons
- borders and hover rings
- section accents and decorative lines
- status emphasis on booking/provider surfaces

### Supporting colors seen repeatedly

- dark backgrounds: `#0d0d0d`, `#111111`, `#111115`, `#141417`
- light backgrounds: `#f5f4f1`, `#f5f2ee`, `#f0ece8`, `#faf8f5`, `#ffffff`
- dark text: `#111115`, `#44403c`, `#6b6663`
- light text: `#f0ece8`, `#ffffff`
- success: emerald / green family
  - examples: `#10b981`, `#059669`, `#4ade80`
- warning: amber family
  - examples: `#f59e0b`, `#d97706`
- info: blue family
  - examples: `#3b82f6`, `#2563eb`
- error/cancel: red family
  - examples: `#ef4444`, `#E8192C`

## Theme Surfaces

### Light mode

Light mode tends to use warm neutral backgrounds instead of cold white/gray SaaS surfaces.

Common pairings:

- page background: `#f5f4f1`
- cards: `#ffffff`
- soft panels: `#f5f2ee`, `#f0ece8`, `#faf8f5`
- borders: `#e5e2de`, `#ede9e5`, `#ddd9d5`
- text: `#111115`, `#44403c`, `#6b6663`

### Blue mode

Blue mode is a coastal/light variant built for customer-facing surfaces.

Common pairings:

- page background: `hsl(205 55% 96%)`
- soft panels: `#eff6ff`, `#e0f2fe`, `rgba(255,255,255,0.82)`
- borders: `rgba(2,132,199,0.12)` to `rgba(2,132,199,0.18)`
- primary accent: `hsl(204 78% 44%)`
- supporting accent: `hsl(199 72% 52%)`
- text: `hsl(212 48% 18%)`, `hsl(211 22% 42%)`

Design intent:

- lighter and more coastal than the default warm-light theme
- still premium, but cleaner and more airy
- especially suited for search, booking, and map experiences

### Dark mode

Dark mode uses near-black neutral layers with soft translucent borders rather than bright neon contrast.

Common pairings:

- page background: `#0d0d0d`
- header/deep sections: `#111111`, `#111115`
- cards: `rgba(255,255,255,0.025)` to `rgba(255,255,255,0.04)`
- borders: `rgba(255,255,255,0.05)` to `rgba(255,255,255,0.10)`
- text: `#ffffff`, `#f0ece8`, semi-transparent white variants

## Gradients

Global gradients defined in `apps/web/src/index.css`:

- `--gradient-hero`: Adriatic blue -> turquoise
- `--gradient-sunset`: terracotta -> Albanian red
- `--gradient-coastal`: turquoise -> Adriatic blue

New blue-theme-aware gradients are now also used in feature token helpers for:

- home hero surfaces
- home teaser panels
- bookings hero headers
- culture page hero and callout banners
- app bar luxury header state

In component-level styling, gradients are also used for:

- card/image fallbacks
- stats cards
- email headers
- subtle dark overlays on imagery

## Typography

### Main customer-facing type pairing

Used heavily across home/search/discovery components.

- display font: `Bebas Neue, Impact, sans-serif`
  - used for hero titles, labels, prices, strong numeric emphasis, image placeholders
  - visual role: loud, condensed, poster-like, travel/editorial
- body / editorial font: `Crimson Pro, Georgia, serif`
  - used for nav links, property names, metadata, descriptions, badges, supporting copy
  - visual role: elegant, warm, human, premium

These fonts are imported inline in multiple search/home surfaces such as:

- `apps/web/src/components/home/AppBar.tsx`
- `apps/web/src/pages/home/SearchPropertyResults/SearchPropertyResults.tsx`
- `apps/web/src/pages/home/SearchPropertyResults/SearchCarResults.tsx`

### Dashboard/admin typography

Dashboard surfaces are more utility-driven and often rely on inherited sans-serif styles. Some older screens still explicitly use `Inter`.

Example inconsistency:

- `apps/web/src/pages/dashboard/Cars/AllCars.tsx` uses `fontFamily: "'Inter', sans-serif"`

### Theme takeaway for typography

For user-facing marketing, search, property discovery, booking and brand-heavy screens:

- prefer `Bebas Neue` for bold headings and numeric emphasis
- prefer `Crimson Pro` for body copy and premium product information

For operational dashboard screens:

- a restrained sans-serif layer is acceptable
- retain the red accent and neutral surface palette so dashboard screens still feel like Bookinal

## Radius, Borders, and Shape Language

### Global token

- `--radius`: `0.75rem`

### Typical shape usage

- main cards: `12px` to `16px`
- larger containers / dialogs: `16px` to `24px`
- pills / CTA buttons: full rounded / `999px`
- small badges in editorial surfaces: often very tight radii like `2px` to `6px`

Visual character:

- dashboards skew softer and more rounded
- editorial cards sometimes use sharper corners for a magazine-like feel

## Motion and Interaction Language

Defined globally in `tailwind.config.ts` and reinforced locally in pages.

### Tailwind animations

- `fade-in`
- `fade-in-up`
- `scale-in`
- `accordion-down`
- `accordion-up`

### Common interaction patterns

- slight card lift on hover (`translateY(-2px)` to `translateY(-3px)`)
- red glow / shadow intensification on hover
- image zoom on card hover
- shimmer skeletons on loading states
- subtle opacity changes rather than aggressive motion

Overall motion style is polished and restrained, not playful or bouncy.

## Customer-Facing Visual Language

Most recognizable pattern used in discovery/search/property cards:

- dark luxury or warm editorial atmosphere
- strong red highlight lines and red micro-accents
- serif body copy with condensed display headings
- image-led cards with subtle overlays
- premium travel magazine tone rather than generic marketplace UI

Representative files:

- `apps/web/src/components/home/AppBar.tsx`
- `apps/web/src/components/home/PropertyCard.tsx`
- `apps/web/src/components/home/CarCard.tsx`
- `apps/web/src/pages/home/SearchPropertyResults/SearchPropertyResults.tsx`
- `apps/web/src/pages/home/SearchPropertyResults/FilterBar.tsx`

Additional customer-facing areas now partially migrated to shared theme tokens:

- `apps/web/src/pages/home/CultureDetails.tsx`
- `apps/web/src/pages/home/MyAccount.tsx`
- `apps/web/src/pages/home/booking/BookingsSummary.tsx`
- `apps/web/src/pages/home/booking/CarReservation.tsx`
- `apps/web/src/pages/home/booking/ApartmentReservation.tsx`

## Dashboard Visual Language

Dashboard pages use the same dark/light theme mode but are generally more pragmatic.

Common traits:

- strong `tk` token objects per screen
- dark mode defaults to near-black layers
- light mode defaults to warm neutrals, not cool grays
- red is still the anchor accent for actions, states, and icons
- cards and inputs rely on translucent white in dark mode and parchment-like panels in light mode

Representative files:

- `apps/web/src/pages/dashboard/bookings/BookingsManagement.tsx`
- `apps/web/src/pages/dashboard/Hotels/HotelDetails.tsx`
- `apps/web/src/pages/dashboard/Hotels/components/AddHotelDialog.tsx`

## Component Token Pattern

Many screens define a local `tk` object derived from `isDark`. This is a major architectural pattern in the app.

Typical token categories:

- page background / text
- card background / border
- input background / border / text
- muted / dim / label text
- stat surfaces
- icon colors
- modal / popover colors

This means the practical theme system is split into two layers:

1. global CSS variables for broad Tailwind integration
2. local per-screen token objects for highly art-directed component styling

The cleanup is now evolving toward three layers:

1. global CSS variables for app-wide semantic themes
2. shared feature token helpers for major areas like home/search/booking
3. local `tk` objects only where a screen still needs bespoke styling

## Current Theme Summary

If you need a one-paragraph design brief for future work, use this:

Bookinal uses an Albania-inspired editorial travel theme built around bold red accents, Adriatic blues, warm stone neutrals, and dark charcoal surfaces. Customer-facing pages lean on a distinctive `Bebas Neue` + `Crimson Pro` type pairing that feels premium, geographic, and memorable. Dashboard pages are more functional but still inherit the same red-led identity, warm light theme, and near-black dark theme. Motion is subtle, with lift, shimmer, fade, and image zoom used to add polish without overwhelming the interface.

Updated short version:

Bookinal now supports three visual modes: a dark charcoal mode, a warm editorial light mode, and a newer coastal blue mode. The brand still centers on bold Albanian red, but the blue theme introduces a lighter Adriatic-inspired experience for public-facing browsing and booking flows. The design language remains editorial and travel-focused, with strong display typography, premium imagery, rounded cards, and restrained motion.

## Recommended Rules For Future UI Work

- Use Bookinal red as the main action accent, not generic blue or purple.
- In blue mode, use the established Adriatic/coastal token set instead of inventing a separate blue palette per component.
- In light mode, favor warm parchment/stone neutrals over cold gray SaaS backgrounds.
- In dark mode, use layered charcoal/ink surfaces instead of flat black.
- For branded user-facing surfaces, prefer `Bebas Neue` for display and `Crimson Pro` for body.
- Keep borders soft and slightly translucent in dark mode.
- Prefer shared feature helpers like `homeTheme.ts`, `searchResultsTheme.ts`, and `bookingTheme.ts` before creating new one-off theme objects.
- Use rounded containers generously, but allow sharper micro-badges where editorial styling helps.
- Motion should feel premium and calm: fade, lift, shimmer, zoom; avoid springy novelty motion.
- When creating a new page, start from the existing `tk` token-object pattern if the surrounding area already uses it.

## Notable Inconsistencies To Be Aware Of

- Fonts are not yet centralized; several pages import fonts inline.
- Some dashboard screens still use `Inter` or default sans-serif styling.
- Some customer-facing screens are highly art-directed while others remain more utilitarian.
- There is overlap between CSS-variable theming and local hard-coded colors.
- Some newer blue-theme migrations use shared helpers, while older files still contain direct color literals.
- Search, booking, and home pages are now partly centralized, but the migration is not yet complete across the whole app.

These inconsistencies mean future cleanup could centralize fonts and shared semantic tokens, but any new work should still preserve the established Bookinal identity described above.
