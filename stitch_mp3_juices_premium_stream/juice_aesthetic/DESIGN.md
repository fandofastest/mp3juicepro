---
name: Juice Aesthetic
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#baccb0'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#85967c'
  outline-variant: '#3c4b35'
  surface-tint: '#2ae500'
  primary: '#efffe3'
  on-primary: '#053900'
  primary-container: '#39ff14'
  on-primary-container: '#107100'
  inverse-primary: '#106e00'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#fff8f7'
  on-tertiary: '#442927'
  tertiary-container: '#ffd3ce'
  on-tertiary-container: '#7a5955'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#79ff5b'
  primary-fixed-dim: '#2ae500'
  on-primary-fixed: '#022100'
  on-primary-fixed-variant: '#095300'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#e7bdb8'
  on-tertiary-fixed: '#2c1513'
  on-tertiary-fixed-variant: '#5d3f3c'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is built for a premium, high-energy music streaming experience. It targets a modern, trend-conscious audience that values both technical precision and aesthetic vibrancy. The brand personality is "Electric Sophistication"—it feels like a high-end dark-mode studio environment punctuated by bursts of synthetic color.

The design style is a hybrid of **Modern Minimalism** and **Glassmorphism**. By utilizing deep charcoal foundations and translucent overlays, the UI creates a sense of immense depth and focus. High-quality artist imagery is central to the experience, with UI elements serving as sophisticated frames for the content. The emotional response should be one of "effortless cool," providing a professional-grade interface that remains approachable and exciting.

## Colors

The palette is anchored in a true dark mode to maximize visual comfort and battery efficiency. 

- **Primary (Electric Green):** Used exclusively for high-priority actions, playback progress, and "live" indicators. It represents the "Juice" of the brand.
- **Secondary (Bright Teal):** Utilized for secondary interactive elements, accents in data visualization, and subtle gradients.
- **Neutral (Deep Charcoal/Black):** The foundation. `#121212` is the global background, while `#1E1E1E` serves as the elevated surface color.
- **Glass Effects:** A semi-transparent white tint is used for floating navigation bars and player controls, creating a frosted glass look over colorful album art.

## Typography

This design system uses a dual-font approach to balance impact with legibility. **Montserrat** is the voice of the brand, used for headlines and artist names where its geometric, bold nature can command attention. **Inter** is the workhorse for body text, track listings, and metadata, ensuring maximum readability even at small sizes or on low-quality displays.

Hierarchies are strictly enforced through weight: use ExtraBold (800) for major headers to create a "poster-like" editorial feel. Letter spacing is slightly tightened on headlines for a more compact, modern look, while labels use slightly increased tracking to ensure clarity against dark backgrounds.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with generous safe areas to allow the glassmorphic effects "room to breathe." 

- **Desktop:** A 12-column grid with 24px gutters. Sidebars are fixed at 280px, while the main content area remains fluid.
- **Mobile:** A 4-column grid with 16px margins. Elements like horizontal "scrolling carousels" should bleed to the edge of the screen to signal more content.
- **Rhythm:** All spacing units are multiples of 8px. Use `lg` (40px) and `xl` (64px) for vertical section spacing to maintain the "premium" airy feel, avoiding cramped information density.

## Elevation & Depth

Depth is established through a combination of **Glassmorphism** and **Tonal Layering**. 

1. **Base Layer:** The deepest layer is the `#121212` background.
2. **Surface Layer:** Cards and containers use `#1E1E1E` with a subtle 1px border of `rgba(255, 255, 255, 0.1)` to define edges without using heavy shadows.
3. **Glass Layer:** Overlays (like the bottom player or top navigation) use a `backdrop-filter: blur(20px)` and a semi-transparent fill. This allows the colors of album art to bleed through as the user scrolls.
4. **Interactive Elevation:** On hover, cards should subtly scale (1.02x) and increase shadow diffusion using a tinted shadow (e.g., `0px 20px 40px rgba(0, 0, 0, 0.4)`).

## Shapes

The shape language is consistently rounded to evoke a friendly yet modern feel. 

- **Standard Elements:** Use `rounded-lg` (16px) for album art, playlist cards, and modal containers.
- **Buttons & Pills:** Buttons and category tags should always be pill-shaped (full radius) to contrast against the more structural card elements.
- **Input Fields:** Search bars and text inputs use a 12px radius to sit comfortably between the softness of pills and the structure of cards.

## Components

- **Buttons:** Primary buttons are pill-shaped with a solid Electric Green fill and black text. Secondary buttons are "Ghost" style with a white or teal 1.5px border.
- **Chips/Categories:** Use a glass-style background (`rgba(255, 255, 255, 0.1)`) with no border for inactive states, switching to a solid Teal for active states.
- **Cards:** All cards (Album, Artist, Podcast) must have a 16px corner radius. The artist card is unique: it uses a circular image to differentiate from square album art.
- **Inputs:** Search bars should utilize a deep grey fill (`#2A2A2A`) with a subtle 1px white border at 10% opacity. Upon focus, the border transitions to Electric Green.
- **Playback Bar:** A full-width glass component at the bottom of the screen. The progress bar is a 4px thin line that expands to 8px on hover, using a gradient from Teal to Electric Green.
- **Visualizers:** When music is playing, incorporate small motion-based frequency bars next to the track name using the Primary accent color.