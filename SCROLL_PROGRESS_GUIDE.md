# Scroll Progress Implementation Guide

## What Was Added

A scroll-triggered animated progress bar that appears when users scroll down past the header (100px threshold). Choose between two animated styles: Football Field or Trophy.

## Files Added

```
src/components/
├── ScrollProgress.tsx           # Main scroll progress component
├── ScrollProgress.css           # Sticky positioning and animations
├── TrophyProgress.tsx           # Growing trophy animation
├── TrophyProgress.css
├── FootballFieldProgress.tsx    # Football field yard-by-yard progress
└── FootballFieldProgress.css
```

## How It Works

1. **At the top of page**: Users see the normal Header with team helmets and Super Bowl logo
2. **When scrolling down**: After scrolling 100px, a sticky progress bar slides in from the top
3. **When scrolling back up**: Progress bar slides away, revealing the original header

## Changing the Animation Style

In `LeagueView.tsx`, find this line:

```typescript
<ScrollProgress
  progressPercentage={progressPercentage || computedProgress}
  style="football"  // <-- CHANGE THIS
/>
```

Available styles:

- `'football'` - Football field with yard markers (default)
- `'trophy'` - Growing Lombardi Trophy with sparkles
- `'simple'` - Simple gradient progress bar

## Animation Features

### Football Field

- Top-down field view with 10-yard markers
- Bouncing football advances across the field
- "TOUCHDOWN!" celebration at 100%
- Confetti bursts in end zone
- Team colors fill behind the ball

### Trophy

- Trophy grows from 20px to 40px height
- Sparkles appear at 50%+ progress
- Spinning celebration at 100%
- Gradient shimmer effect
- Gold accents throughout

## Customization

### Scroll Threshold

In `ScrollProgress.tsx`, change the threshold:

```typescript
const scrollThreshold = 100; // Pixels from top
```

### Animation Duration

Edit the component's CSS file to adjust:

- Slide-in timing: `.scroll-progress { transition: transform 0.3s }`
- Celebration duration: In each component's `setTimeout()` calls

### Team Colors

Progress components automatically use CSS custom properties set by the Header:

- `--header-left-accent` (Team 1 color)
- `--header-right-accent` (Team 2 color)

These are pulled from `TEAM_THEMES` in `src/theme/teams.ts`.

## Testing

1. Start the dev server: `yarn run dev`
2. Open a league
3. Scroll down past the header
4. Watch the progress bar slide in
5. Complete some questions to see progress advance
6. Fill all questions to see 100% celebration

## Accessibility

- Uses `prefers-reduced-motion` media query
- Proper z-index layering (progress bar at z-index: 100)
- iPhone notch support with `env(safe-area-inset-top)`
- Smooth transitions with hardware acceleration

## Next Steps

Consider adding:

- User preference to choose their favorite style (localStorage)
- Sound effects on touchdown/completion
- Different celebrations for different milestones (25%, 50%, 75%)
- Custom team-specific celebrations
