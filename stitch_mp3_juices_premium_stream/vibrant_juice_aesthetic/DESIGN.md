---
name: Vibrant Juice Aesthetic
colors:
  surface: '#0c141e'
  surface-dim: '#0c141e'
  surface-bright: '#323a45'
  surface-container-lowest: '#070f19'
  surface-container-low: '#141c26'
  surface-container: '#18202b'
  surface-container-high: '#232a35'
  surface-container-highest: '#2d3541'
  on-surface: '#dbe3f2'
  on-surface-variant: '#c2c6d4'
  inverse-surface: '#dbe3f2'
  inverse-on-surface: '#29313c'
  outline: '#8c909e'
  outline-variant: '#424752'
  surface-tint: '#abc7ff'
  primary: '#abc7ff'
  on-primary: '#002f66'
  primary-container: '#0d5cb9'
  on-primary-container: '#c8d9ff'
  inverse-primary: '#0d5cb9'
  secondary: '#cbc6b8'
  on-secondary: '#333027'
  secondary-container: '#4a473c'
  on-secondary-container: '#bab5a7'
  tertiary: '#aac7ff'
  on-tertiary: '#002f64'
  tertiary-container: '#005db9'
  on-tertiary-container: '#c7d9ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#abc7ff'
  on-primary-fixed: '#001b3f'
  on-primary-fixed-variant: '#004590'
  secondary-fixed: '#e8e2d3'
  secondary-fixed-dim: '#cbc6b8'
  on-secondary-fixed: '#1d1c13'
  on-secondary-fixed-variant: '#4a473c'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#aac7ff'
  on-tertiary-fixed: '#001b3e'
  on-tertiary-fixed-variant: '#00458d'
  background: '#0c141e'
  on-background: '#dbe3f2'
  surface-variant: '#2d3541'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 2rem
  gutter-grid: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  container-max: 1200px
---

## Brand & Style

This design system is built for high-energy, digital-first experiences centered around media and search. It combines the intensity of **High-Contrast / Bold** aesthetics with a refined **Modern** structure. The target audience consists of digital natives who prioritize speed and visual clarity.

The interface evokes an atmosphere of fluid energy—dynamic and "juicy"—through the use of punchy accent colors against deep, immersive backgrounds. It balances utility with a bold, urban personality, ensuring that every interaction feels responsive and high-impact.

## Colors

The palette is anchored by a deep, midnight neutral that provides a foundation for the high-vibrancy **Electric Blue** primary accent. 

- **Primary (#0D5CB9):** Used for critical brand elements, progress bars, active states, and primary iconography.
- **Secondary (#F5EFE0):** A warm bone-white used for high-contrast CTA backgrounds to ensure maximum legibility against the blue and dark fields.
- **Tertiary (#1672DB):** A lighter, glow-oriented blue used for hover states and subtle gradients.
- **Neutral (#08101A):** The core background color, providing a deep canvas that makes the blues feel luminous.

Color application should prioritize high contrast ratios for accessibility while maintaining the saturated "Juice" aesthetic.

## Typography

The design system utilizes **Montserrat** exclusively to achieve a clean, geometric, and modern look. The typeface's wide character set and high x-height make it ideal for both impactful headlines and functional UI labels.

Headlines should utilize heavy weights (Bold/700) to command attention. Body text remains at a standard weight (Regular/400) for readability, while navigation and utility labels use Medium (500) or Semi-Bold (600) with slight letter spacing to create a distinct hierarchy from prose.

## Layout & Spacing

The layout follows a **Fluid Grid** system that maximizes the use of horizontal space while maintaining strict vertical rhythms. 

- **Desktop:** A 12-column grid with 24px (1.5rem) gutters. Content is typically centered in a 1200px container.
- **Mobile:** A 4-column grid with 16px (1rem) margins. Large components like search bars span the full width.
- **Rhythm:** Spacing follows an 8px base scale. Vertical "stacks" are used to group related content, using 16px for internal component spacing and 32px for section separation.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and subtle **Glassmorphism** rather than traditional heavy shadows.

- **Surface 0:** The primary background (#08101A).
- **Surface 1:** Container backgrounds that use a slightly lighter blue-tinted dark grey or a semi-transparent blur (10-20% opacity) over the primary background.
- **Accents:** Active elements use an inner "glow" or a soft outer bloom in the Primary Blue color to simulate light emission.
- **Outlines:** Low-contrast borders (1px, 20% white or primary blue) are used to define boundaries for inputs and cards without breaking the flat, immersive feel.

## Shapes

The shape language is defined by a consistent **Rounded** (Level 2) approach. This balances the aggressive bold colors with an approachable and ergonomic feel.

- **Base Radius:** 0.5rem (8px) for standard buttons and input fields.
- **Large Radius:** 1rem (16px) for cards, search containers, and modal surfaces.
- **Interactive Elements:** Maintain consistent radii across all states to ensure the UI feels stable during transitions.

## Components

### Buttons
- **Primary:** Background in Secondary color (#F5EFE0), Text in Neutral (#08101A), Bold weight.
- **Ghost:** Primary Blue border and text, transparent background.

### Input Fields
- Dark background with a Primary Blue stroke on focus.
- Placeholder text in a muted blue-grey for legibility without distraction.

### Progress Bars & Sliders
- Track: Deep neutral with 20% opacity.
- Fill: Solid Primary Blue (#0D5CB9) with a subtle glow effect at the leading edge.

### Cards & Containers
- Subtle background blur (backdrop-filter: blur(10px)) for floating elements.
- Soft 1px border using a light tint of the primary color.

### Chips & Badges
- Small, pill-shaped elements using the Primary Blue background with white text for active states, or dark backgrounds with blue borders for inactive categories.