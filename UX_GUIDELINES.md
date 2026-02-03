# UX Design Guidelines

Design reference for all UI components. Follow these principles for every component, screen, and interaction.

## Core Principles

1. **Clarity** — Content is the priority. UI chrome should recede. Every element must earn its place.
2. **Deference** — The interface serves the content. Avoid heavy borders, drop shadows, and visual clutter that compete with what matters.
3. **Depth** — Use subtle layers, translucency, and motion to convey hierarchy without decoration.

## Visual Foundation

### Color Philosophy

- **Backgrounds**: Use translucent layers, not opaque fills. Build depth with `rgba(255,255,255,0.04)` increments rather than distinct hex colors.
- **Borders**: Thin (1px-1.5px), semi-transparent (`rgba(255,255,255,0.1)`). Never heavy or opaque borders on interactive elements.
- **Selection/Active states**: Tint the background with the accent color at low opacity (`rgba(accent, 0.08-0.15)`), not solid fills.
- **Text hierarchy**: Primary text at full opacity, secondary at 60%, tertiary/disabled at 35%. Use weight and size, not color variety, to create hierarchy.
- **Accent color**: Use sparingly. It should draw the eye to the single most important action or state on screen.

### Typography

- **Font stack**: `-apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif`
- **Letter spacing**: Tighten headlines slightly (`-0.02em` to `-0.03em`). Body text at default or `-0.01em`.
- **Weight scale**: Regular (400) for body, Medium (500) for labels, Semibold (600) for emphasis, Bold (700) for headlines only.
- **Size scale**: Use a modular scale. Avoid arbitrary sizes. Suggested: 13, 15, 17, 20, 24, 28, 34px.
- **Line height**: 1.2 for headlines, 1.4-1.5 for body text, 1.0 for single-line labels.

### Spacing (8px Grid)

All spacing must be multiples of 8. Use the design tokens:

| Token         | Value | Usage                            |
| ------------- | ----- | -------------------------------- |
| `--space-xs`  | 8px   | Tight: icon gaps, inline spacing |
| `--space-sm`  | 12px  | Compact: between related items   |
| `--space-md`  | 16px  | Standard: internal padding       |
| `--space-lg`  | 24px  | Comfortable: section padding     |
| `--space-xl`  | 32px  | Generous: between sections       |
| `--space-2xl` | 40px  | Spacious: major section breaks   |

**Rules:**

- Padding inside containers: `--space-lg` desktop, `--space-md` mobile.
- Space between stacked cards/sections: `--space-lg` desktop, `--space-md` mobile.
- Space between items within a group (e.g., radio options): `--space-xs`.
- Never use arbitrary values like 10px, 14px, 18px, 22px.

### Border Radius

| Element      | Radius              |
| ------------ | ------------------- |
| Cards/Modals | 16px                |
| Buttons      | 12px                |
| Inputs       | 12px                |
| Badges/Pills | 9999px (full round) |
| Small chips  | 8px                 |

Nested elements should have slightly smaller radius than their parent.

## Component Patterns

### Buttons

- **Primary**: Solid accent color fill, dark text. Full-width on mobile. `min-height: 56px`.
- **Secondary**: Transparent background, subtle border (`rgba(255,255,255,0.15)`), light text.
- **Ghost/Tertiary**: No border, no background. Text-only with muted color. Use for low-priority actions.
- **Destructive**: Solid `--color-error` fill. Reserve for irreversible actions. Always require confirmation.
- **Disabled**: 35% opacity on the entire button. Never change the color scheme.
- **Press state**: `transform: scale(0.98)` with fast spring easing. Never change color on press.
- **No outlines or rings on focus for touch devices**. Use `:focus-visible` for keyboard users only.

### Selection Controls (Radio/Checkbox)

- **Hide native controls** (`opacity: 0; position: absolute`). The entire row is the tap target.
- **Unselected**: Translucent background (`rgba(255,255,255,0.04)`), subtle border (`rgba(255,255,255,0.1)`).
- **Selected**: Accent-tinted background (`rgba(accent, 0.12)`), accent border, text turns accent color and gains weight (500 -> 600).
- **Selection indicator**: A small filled circle (22px) with an SVG checkmark, positioned at the trailing edge (right side). Only visible when selected.
- **Center the label text** within the option. The checkmark is an absolute-positioned overlay, not part of the flow.
- **Spacing between options**: `--space-xs` (8px). Options should feel like a grouped unit, not isolated items.

### Cards

- **Background**: One step above the page background in the translucency stack, or use `rgba(255,255,255,0.03)`.
- **Border**: 1px `rgba(255,255,255,0.08)`. Avoid visible/prominent borders.
- **No drop shadows** on cards in dark mode. Use border + background contrast for depth.
- **Padding**: `--space-lg` (24px) desktop, `--space-md` (16px) mobile.
- **Card groups**: Stack with `--space-md` gap. Related cards should feel like a single surface broken into sections.

### Text Inputs

- **Border**: 1.5px, semi-transparent. Accent color on focus.
- **Focus state**: Accent border + subtle glow (`box-shadow: 0 0 0 3px rgba(accent, 0.15)`). Keep the glow soft, not aggressive.
- **Placeholder text**: 40% opacity. Never use placeholder as a label.
- **Always pair with a visible label** above the input.
- **Height**: Match button height (`min-height: 56px`) for visual consistency.

### Modals/Dialogs

- **Backdrop**: `rgba(0,0,0,0.5)` with `backdrop-filter: blur(20px)` where supported.
- **Modal surface**: Slightly elevated from page background. `border-radius: 16px`.
- **Max height**: `90dvh` minus safe area insets. Always scrollable if content overflows.
- **Action buttons**: Right-aligned. Primary action on the right. Destructive actions use error color.
- **Dismiss**: Clicking backdrop closes the modal. Always provide an explicit close/cancel action.

### Tabs/Segmented Controls

- **Use a pill-shaped background** for the active tab, not an underline.
- **Background track**: Subtle fill (`rgba(255,255,255,0.06)`) with rounded corners.
- **Active indicator**: Solid accent or slightly elevated surface with subtle shadow.
- **Transition**: Slide the active pill between positions with spring easing.
- **Equal width segments** when there are 2-4 options.

### Badges/Pills

- **Point badges**: Accent background, dark text. Fully rounded (`border-radius: 9999px`).
- **Status badges**: Use semantic colors (success/error/warning) at low background opacity with solid text.
- **Keep text short**: 1-3 words max. If longer, it's not a badge.

## Motion & Animation

### Timing

| Type          | Duration | Easing                              |
| ------------- | -------- | ----------------------------------- |
| Micro (hover) | 150ms    | `ease-out`                          |
| State change  | 250ms    | `cubic-bezier(0.4, 0, 0.2, 1)`      |
| Enter/appear  | 350ms    | `cubic-bezier(0.0, 0, 0.2, 1)`      |
| Exit/dismiss  | 250ms    | `cubic-bezier(0.4, 0, 1, 1)`        |
| Spring/bounce | 500ms    | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

### Rules

- **Every animation must be interruptible**. Never block interaction during transitions.
- **Respect `prefers-reduced-motion`**: Replace motion with instant state changes. No exceptions.
- **One animation per interaction**. A tap should trigger one visual response, not a cascade.
- **Avoid animation for decoration**. Motion communicates state changes, spatial relationships, or feedback.
- **Entrances**: Fade in + slight upward translate (10-20px). Never slide from the side.
- **Press feedback**: `scale(0.97-0.98)` on buttons/cards. Quick in, quick out.

## Accessibility (Non-Negotiable)

### Touch Targets

- **Minimum 44x44pt** (Apple HIG). Prefer 56px for primary actions.
- **Spacing between targets**: At least 8px gap so adjacent targets don't overlap.
- **The entire row/card is the target**, not just the text or icon within it.

### Contrast

- **Text on backgrounds**: Minimum 4.5:1 ratio (WCAG AA).
- **Large text (18px+)**: Minimum 3:1 ratio.
- **Interactive elements**: Must be distinguishable from static content without relying on color alone.

### Screen Readers

- **Semantic HTML**: Use `<button>`, `<label>`, `<input>`, `<nav>`. Never style a `<div>` as a button.
- **Labels**: Every input must have an associated `<label>`. Use `for`/`id` pairing.
- **Hidden inputs**: When native controls are visually hidden, ensure `aria-checked` or equivalent state is conveyed. Labels wrapping inputs handle this automatically.

### Elderly Users (Project-Specific)

- **Minimum font size**: 16px on mobile, 17px on desktop. Never smaller for interactive labels.
- **High-contrast mode**: The app already uses light-on-dark. Maintain strong text/background contrast.
- **Generous padding**: Err on the side of more whitespace. Cramped layouts cause mis-taps.
- **Clear visual feedback**: Selection states must be obvious, not subtle. Use both color AND a visible indicator (checkmark, fill change).

## Mobile / iPhone

### Safe Areas

- **Always use `viewport-fit=cover`** in the viewport meta tag.
- **Pad for safe areas**: `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, etc.
- **Buttons near the bottom** must clear the home indicator: `padding-bottom: calc(value + env(safe-area-inset-bottom))`.

### Viewport Units

- **Use `dvh`** (dynamic viewport height) instead of `vh`. This accounts for Safari's dynamic toolbar.
- **Modal max-height**: `calc(90dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))`.

### Keyboard Handling

- **Sticky buttons** should use `position: sticky; bottom: 0` with safe area padding so they remain visible when the keyboard opens.
- **Scroll inputs into view** when focused. Use `scrollIntoView({ behavior: 'smooth', block: 'center' })`.

### Touch Interactions

- **`-webkit-tap-highlight-color: transparent`** on all custom interactive elements.
- **No hover-dependent features**. Hover is an enhancement, never the only way to access information.
- **Fast tap response**: No 300ms delay. Use `touch-action: manipulation` on interactive elements.

## Anti-Patterns (Never Do These)

- Heavy drop shadows on dark backgrounds
- Borders thicker than 1.5px on interactive elements
- Opaque colored backgrounds on selection states (use translucent tints)
- Multiple competing animations on a single interaction
- Inline styles in JavaScript/TypeScript (use CSS classes)
- Arbitrary spacing values outside the 8px grid
- Color as the only indicator of state (always pair with shape/icon/weight)
- Fixed `vh` units for layout (use `dvh`)
- Native radio/checkbox circles visible in the UI
- Text smaller than 13px anywhere in the app
