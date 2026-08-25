---
name: Tactile Trust
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#564334'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#897362'
  outline-variant: '#ddc1ae'
  surface-tint: '#904d00'
  primary: '#904d00'
  on-primary: '#ffffff'
  primary-container: '#ff8c00'
  on-primary-container: '#623200'
  inverse-primary: '#ffb77d'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#00658f'
  on-tertiary: '#ffffff'
  tertiary-container: '#00b5fc'
  on-tertiary-container: '#004360'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#c7e7ff'
  tertiary-fixed-dim: '#85cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6c'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  card-gap: 24px
---

## Brand & Style

This design system employs a sophisticated **Neomorphic (Soft UI)** aesthetic tailored for a high-stakes bank fraud-detection environment. The brand personality is calm, reassuring, and tactile, aiming to reduce the cognitive load of fraud analysts who deal with high-stress data. 

By utilizing physical metaphors of light and shadow, the UI creates a "soft-touch" dashboard that feels reliable and modern. The interface moves away from flat, clinical enterprise designs toward a more ergonomic, organic experience. The light source is strictly fixed to the **top-left**, ensuring consistent 3D depth across all extruded and inset elements.

## Colors

The palette is anchored by a soft off-white base (**#F0F0F0**) which serves as the surface color for both the background and the UI elements themselves. Depth is achieved not through hue shifts, but through two specific shadow tokens: a bright highlight (**#FFFFFF**) and a soft depth shadow (**#D1D9E6**).

- **Primary Accent:** Vibrant Orange is reserved for high-priority actions and critical alerts.
- **Surface Base:** The background and element faces must share the same hex code to maintain the neomorphic illusion.
- **Semantic Accents:** Softened versions of Green, Warm Orange, and Red are used for risk scoring (Low, Medium, High) to prevent visual fatigue while maintaining clear categorization.

## Typography

This design system uses **Inter** for all roles to provide a systematic, utilitarian feel that balances the soft neomorphic shapes. 

Headlines use slightly tighter letter spacing and heavier weights to stand out against the low-contrast surfaces. Labels for data points in the fraud console utilize a medium weight to ensure legibility when placed on inset panels. On mobile devices, `headline-lg` should scale down to 24px to maintain layout integrity.

## Layout & Spacing

The design system follows a **fluid grid** model with a standard 12-column layout for desktop. Because neomorphic elements require significant breathing room for their shadows to be visible without overlapping, the spacing rhythm is generous.

- **Margins:** 24px safe area on mobile; 48px on desktop.
- **Gutters:** 16px to 24px between cards to prevent "shadow bleed" where the highlight of one element hits the dark shadow of another.
- **Density:** The fraud console defaults to a "Comfortable" density to accommodate large touch-targets and clear data separation.

## Elevation & Depth

Hierarchy is defined by the direction of the "extrusion." Unlike standard Material design which uses Z-axis elevation with uniform shadows, this system uses **dual-shadow offsets**.

1.  **Extruded (Raised):** Used for interactive elements like buttons and primary cards. 
    - *Top-Left Shadow:* White (#FFFFFF), Blur 16px, Offset -8px, -8px.
    - *Bottom-Right Shadow:* Soft Blue-Grey (#D1D9E6), Blur 16px, Offset 8px, 8px.
2.  **Inset (Sunken):** Used for input fields, search bars, and data containers.
    - *Inner Top-Left Shadow:* Soft Blue-Grey (#D1D9E6), Blur 8px, Offset 4px, 4px.
    - *Inner Bottom-Right Shadow:* White (#FFFFFF), Blur 8px, Offset -4px, -4px.

Avoid using shadows for decorative elements; only functional containers and interactive controls should possess depth.

## Shapes

The shape language is consistently **Rounded**. Soft UI requires significant corner radii to allow the highlights and shadows to wrap naturally around the form. 

- **Standard Buttons/Cards:** 16px (`rounded-lg`) corner radius.
- **Outer Containers:** 24px (`rounded-xl`) corner radius.
- **Badges/Chips:** Fully pill-shaped for immediate distinction from rectangular data cards.

## Components

### Buttons & Interaction
- **Primary Buttons:** Extruded neomorphic surface. On hover, the extrusion height increases slightly. On click (active state), the button transitions to an "Inset" state to simulate a physical press.
- **Accent Buttons:** Uses the Vibrant Orange but maintains a subtle neomorphic gradient (linear top-left to bottom-right) to avoid looking flat.

### Data Entry
- **Input Fields:** Always Inset. The text sits "inside" the surface of the console. Focus states are indicated by a 1px border in Vibrant Orange.
- **Checkboxes:** Small inset squares that fill with the primary color when selected.

### Information Display
- **Fraud Risk Cards:** Large extruded surfaces. The risk level is indicated by a pill-shaped badge in the top right corner using the semantic palette (Soft Green, Warm Orange, Soft Red).
- **Status Badges:** Pill-shaped, flat color (not neomorphic) to ensure they pop against the textured background.
- **Data Grids:** Contained within a large inset panel to visually group related transaction data.

### Navigation
- **Sidebar:** A tall extruded panel on the left. Active navigation links use an "inset" pressed effect to show the current location.