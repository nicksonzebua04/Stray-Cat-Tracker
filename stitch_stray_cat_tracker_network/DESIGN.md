---
name: Street Paws Network
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#343944'
  surface-container-lowest: '#090e17'
  surface-container-low: '#171c25'
  surface-container: '#1b2029'
  surface-container-high: '#252a34'
  surface-container-highest: '#30353f'
  on-surface: '#dee2f0'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dee2f0'
  inverse-on-surface: '#2c303b'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#7bd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#19aee8'
  on-tertiary-container: '#003e55'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#0f131d'
  on-background: '#dee2f0'
  surface-variant: '#30353f'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.75rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends civic empathy with cyberpunk-inspired utility. The interface serves a dual purpose: a hyper-responsive reconnaissance tool for street rescue operatives and an inviting, modern community hub for urban cat guardians. 

The aesthetic is built on **Cyber-Glassmorphism & Tactical Modernism**:
- Deep obsidian and midnight slate canvas layers that allow luminescent telemetry data and real-time animal statuses to cut through effortlessly.
- High-precision cyber emerald vectors signify safety, recent care, and active geolocation tracking.
- Radiant thermal amber and citrus accents draw immediate focus to urgent care, hunger alerts, and critical triage needs.
- Frosted micro-textured surfaces with luminous edge borders convey high technology, clean execution, and purposeful action.

## Colors

The palette operates strictly in dark mode, balancing atmospheric depth with vivid, light-emitting accents:

- **Base Surfaces & Canvases**: `#0a0f18` (Primary background void), `#111827` (Card and modal backdrops), `#1e293b` (Elevated modules, toolbars, and inputs).
- **Primary Signals (Cyber Emerald)**: `#10b981` acts as the primary action and verification hue, shaded to `#059669` for hover states and `#34d399` for glowing stroke highlights. Symbolizes vital health, secure territories, and completed feeding rounds.
- **Secondary Warnings & Alerts (Thermal Amber/Orange)**: `#f59e0b` transitioning to `#fb923c` for high-priority telemetry, urgent rescue tags, medical warnings, and active alert statuses.
- **Tertiary Utility (Telemetry Cyan)**: `#38bdf8` highlights precise GPS nodes, coordinates, and real-time network pings.
- **Neutral Accents & Dividers**: Low-opacity slate `#334155` at 40–60% opacity for tactical dividers and subdued iconography. Text values utilize crisp milk white (`#f8fafc`) for dominant legibility and muted steel (`#94a3b8`) for secondary metrics.

## Typography

The typographic hierarchy combines the warm geometric curves of **Plus Jakarta Sans** for titles, numerical HUD counters, and interactive elements with the ultra-legible neutral cadence of **Inter** for dense metadata, logs, and user reports.

- **Display & Headlines**: Driven by Plus Jakarta Sans. Employs tight negative letter-spacing for an assertive, high-tech silhouette.
- **Data & Telemetry Labels**: Set with uppercase styling, widened tracking (`letterSpacing: 0.04em` to `0.08em`), and medium-to-bold weights to mimic tactical instrumentation readouts.
- **Body & Longform Descriptions**: Powered by Inter with optimized line heights to guarantee effortless readability across poor lighting conditions or direct field deployment.

## Layout & Spacing

The layout is grounded in a fluid 12-column grid system designed to host dynamic geospatial viewports and real-time activity feeds:

- **Desktop (1200px+)**: A dual-pane or multi-column layout featuring an expansive map zone paired with a 12-column feed. Gutters sit at `1.75rem` (`28px`), with `2.5rem` (`40px`) outer canvas margins to retain air around high-density cards.
- **Tablet (768px - 1199px)**: Scales to an 8-column system with a `1.25rem` (`20px`) gutter, prioritizing stacked layout panels and expandable floating trays.
- **Mobile (< 768px)**: Collapses into a 4-column viewport. The live map anchors the base layer with an interactive bottom sheet containing sighting cards and filters, utilizing `1rem` margins and `0.75rem` gutters.
- **Internal Spacing**: Component padding strictly adheres to a proportional 4px/8px rhythm. Dense counters and tag badges consume `space-xs` and `space-sm`, while rich glassmorphic cards and telemetry modals standardise on `space-md` through `space-xl`.

## Elevation & Depth

Visual hierarchy uses a refined synthesis of **Glassmorphism**, **Tonal Layering**, and **Luminescent Ambient Shadows**:

- **Ground Level (Map & Void)**: Pure flat `#0a0f18` base, providing maximum contrast for overlaid UI panels.
- **Surface Layer 1 (Cards, Feeds, Filters)**: `#111827` rendered at 80% opacity with `backdrop-filter: blur(16px)` and a subtle internal outline of `rgba(255, 255, 255, 0.07)`. No heavy drop shadows; depth is established through translucency against background elements.
- **Surface Layer 2 (Active Cards, Popovers, Drawers)**: `#1e293b` at 85% opacity with `backdrop-filter: blur(24px)`, outlined with `rgba(16, 185, 129, 0.2)` on emerald-accented items or `rgba(245, 158, 11, 0.25)` on urgent items. Shadow is an extra-diffused 32px blur tint: `0 12px 32px -4px rgba(0, 0, 0, 0.6)`.
- **Surface Layer 3 (Report Modal & Critical Overlays)**: `#111827` at 95% opacity with a prominent edge stroke `rgba(255, 255, 255, 0.12)` and a multi-tiered ambient glow: `0 20px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(16, 185, 129, 0.15)`.
- **Glowing Elements**: Badges and CTAs cast localized, color-matched outer blooms (`box-shadow: 0 0 12px rgba(16, 185, 129, 0.4)` for emerald and `0 0 12px rgba(245, 158, 11, 0.4)` for amber).

## Shapes

The design system incorporates a modern, softened tech posture using balanced corner curvature (Level 2). This prevents the harshness of brutalist angularity while avoiding overly informal toy-like radiuses:

- **Base Standard (`roundedness`: 2)**: Core cards, sighting panels, input wrappers, and modals feature `0.5rem` (8px) to `1rem` (16px) corners.
- **Status Pills & Chips**: Explicitly circular or pill-contoured (`9999px`) to maintain clear visual separation between structural containers and bite-sized semantic data tags.
- **Interactive Buttons**: Standardized at `0.75rem` (12px) to harmonize with glass cards while feeling tactile and ergonomic for swift touch targeting.

## Components

### Buttons
- **Primary Cyber Action**: High-intensity emerald gradient (`linear-gradient(135deg, #10b981, #059669)`), text in `#0a0f18` (bold 700), with a perimeter highlight of `inset 0 1px 0 rgba(255, 255, 255, 0.3)` and subtle hover bloom (`0 0 16px rgba(16, 185, 129, 0.5)`).
- **Secondary Urgent Action**: Gradient between `#f59e0b` and `#ea580c` for emergency dispatch or critical triage requests.
- **Ghost/Outline**: Transparent fill, 1px perimeter of `rgba(255, 255, 255, 0.15)`, text in `#f8fafc`. Hover transitions to background `rgba(255, 255, 255, 0.05)` and border color to `#10b981`.

### Status Pills
- **Fed Today**: Emerald-tinted frosted fill (`rgba(16, 185, 129, 0.15)`), border `1px solid rgba(16, 185, 129, 0.4)`, text `#34d399`. Prefixed with a glowing emerald pulse dot.
- **Vaccinated**: Telemetry-cyan frosted fill (`rgba(56, 189, 248, 0.15)`), border `1px solid rgba(56, 189, 248, 0.4)`, text `#38bdf8`.
- **Needs Medical Care**: Amber frosted fill (`rgba(245, 158, 11, 0.15)`), border `1px solid rgba(245, 158, 11, 0.5)`, text `#fbbf24`.
- **Urgent / Trap-Neuter-Return (TNR)**: Crimson-amber dynamic pulse fill (`rgba(239, 68, 68, 0.2)`), border `1px solid #ef4444`, text `#fca5a5`.

### Sighting & Profile Cards
- Frosted glass structure with a 16px blur, 1px micro-border (`rgba(255, 255, 255, 0.08)`).
- Integrated image window with rounded top corners, showing a live HUD overlay (distance in meters, timestamp like "12m ago", and localized colony alias).
- Bottom pane contains name/moniker, health pill indicators, and quick-action icon controls (Log Feeding, Update Location, Flag Medical).

### Statistics Counters
- Monolithic numeric values rendered in **Plus Jakarta Sans** (Display Sm, 700) with a linear gradient mask fading from `#f8fafc` down to `#94a3b8`.
- Accompanying tiny micro-labels (`label-sm`) in tracking `0.08em` uppercase typography.
- Micro sparklines or ambient status arcs illuminated in `#10b981` indicating daily colony check-in percentages.

### Search & Filter Chips
- Capsule-shaped pills (`padding: 6px 14px`) with `rgba(30, 41, 59, 0.8)` background.
- Inactive state uses muted text (`#94a3b8`) and faint borders.
- Active state lights up with an emerald or amber underglow, saturated icon glyph, and contrasting text (`#f8fafc`).

### Interactive Report Modal
- Centered HUD dialog anchored by a translucent dark slate shroud (`rgba(10, 15, 24, 0.8)`).
- Modal features multi-step telemetry: Geolocation pin dropper, photo uploader with drag-and-drop boundary line, feline condition checkboxes, and immediate dispatch toggle.
- Pinned bottom bar containing quick cancel and affirmative "Transmit Report" glowing action button.

### Form Inputs & Checkboxes
- **Inputs**: Dark slate surface (`#1e293b`), inset border `1px solid rgba(255, 255, 255, 0.1)`, transitioning to `#10b981` on focus with a surrounding `0 0 0 3px rgba(16, 185, 129, 0.2)` ring.
- **Checkboxes & Radios**: Custom square/round targets with obsidian centers. Checked state manifests as a solid cyber-emerald matrix with a crisp dark vector glyph.