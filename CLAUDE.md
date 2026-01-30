# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file HTML/JavaScript application for a Super Bowl prediction game (Seahawks vs Patriots). The app uses InstantDB for real-time data synchronization and is designed with a mobile-first approach optimized for elderly users.

## Key Architecture

### Single-File Application Structure
- **Everything in `index.html`**: All HTML, CSS, and JavaScript code is contained in one file
- **No build process**: The app runs directly in the browser with no compilation or bundling
- **CDN dependencies**: Tailwind CSS and InstantDB are loaded via CDN

### Data Architecture (InstantDB)
The app uses InstantDB as a real-time database with two main entities:

**leagues entity:**
- `name`: League name (string)
- `slug`: URL-friendly version of name (string)
- `creatorId`: User ID of league creator (string)
- `isOpen`: Boolean controlling if submissions are allowed
- `actualResults`: Object containing game results (null until admin enters them)

**predictions entity:**
- `userId`: Unique user identifier (stored in localStorage)
- `teamName`: Display name for the team (string)
- `leagueId`: Foreign key to leagues (string)
- `predictions`: Object with question IDs as keys and answers as values
- `score`: Calculated score (number, computed after results entered)
- `tiebreakDiff`: Absolute difference for tiebreaker question (number)

### Application Flow
1. **League Creation**: First visitor creates a league, gets a shareable URL with `?league=slug` parameter
2. **Team Entry**: Users visiting the league URL enter their team name
3. **Predictions**: Users submit predictions (stored/updated in InstantDB)
4. **Admin Controls**: League creator has access to admin panel (separate tab) to:
   - Toggle submissions open/closed
   - Enter actual game results
   - Trigger automatic score calculation
5. **Real-time Leaderboard**: All users see live-updating leaderboard via InstantDB subscriptions

### State Management
Global JavaScript variables track application state:
- `currentLeague`: The active league object
- `allPredictions`: Array of all predictions for the current league
- `currentUserId`: Persistent user ID from localStorage
- `currentTeamName`: Team name for current user
- `isLeagueCreator`: Boolean indicating if current user created the league
- `currentTab`: Admin tab state ('predictions' or 'admin')

### User Identification
- Users are identified by a generated `userId` stored in `localStorage`
- Format: `user-{random}-{timestamp}`
- This persists across sessions but is device/browser-specific

### Question Configuration
The `questions` array (line 346) defines all 15 prediction questions:
- Each has: `id`, `label`, `type` (radio/number), `options` (for radio), `points`
- Question 2 (`totalPoints`) is the tiebreaker with 0 points
- Total possible score: 80 points

## Development Commands

### Local Testing
```bash
# Open the file directly in a browser
open index.html
```

### Multi-User Testing
Open multiple browser windows/tabs with different league/team parameters:
- `index.html` - Initial league creation flow
- `index.html?league=test-league` - Join existing league
- `index.html?league=test-league&team=team-one` - Specific team view

Use browser DevTools to:
- Clear localStorage to simulate new users
- Inspect Network tab for InstantDB WebSocket traffic
- Check Console for errors

### Deployment
```bash
# Deploy to Netlify (drag-and-drop or CLI)
netlify deploy --prod --dir .
```

## InstantDB Configuration

**App ID Location**: Line 334 in `index.html`
```javascript
const APP_ID = '8b6d941d-edc0-4750-95ec-19660710b8d6';
```

**Required Permissions**: The InstantDB app must allow public read/write access since there is no authentication system.

**Query Pattern**: The app uses `db.subscribeQuery()` for real-time updates:
```javascript
db.subscribeQuery(
    { leagues: { $: { where: { slug: leagueParam } } }, predictions: {} },
    (result) => { /* handle updates */ }
)
```

## Design System (Seahawks Theme)

**Color Palette** (defined in CSS variables, line 13-16):
- Navy: `#002244` (primary background)
- Action Green: `#69BE28` (accent, buttons)
- Wolf Grey: `#A5ACAF` (secondary elements)

**Accessibility Features for Elderly Users**:
- Large fonts: 18px body, 20px inputs, 24px headers, 32px title
- Large tap targets: Minimum 48px height for all interactive elements
- Large radio buttons: 40px custom-styled
- High contrast: White text on navy background
- Generous spacing: 24px between questions, 16px padding
- Single column layout: Max-width 640px, centered
- Hover states with visual feedback (scale transform, background color)

## Code Modification Guidelines

### Modifying Questions
To add/remove/change questions, edit the `questions` array (line 346):
- Each question needs: `id`, `label`, `type`, and `points`
- Radio questions need `options` array
- Ensure the `id` is unique and used consistently across prediction/result forms

### Changing Scoring Logic
The `calculateScore()` function (line 645) compares predictions to actual results:
- Iterates through all questions except tiebreaker
- Awards `q.points` for exact matches
- Handles both string and number comparisons

### Adding Admin Features
Admin-specific UI is controlled by `isLeagueCreator` boolean:
- Set to true when `currentLeague.creatorId === currentUserId`
- Admin panel uses tab navigation (line 283-305)
- Admin can submit predictions AND manage game state

### Styling Changes
All styles are in the `<style>` tag (line 12-232):
- CSS custom properties for colors
- Responsive design is mobile-first (max-width: 640px container)
- Maintain large tap targets for accessibility

## Troubleshooting

### Predictions Not Saving
- Verify InstantDB App ID is correct (line 334)
- Check browser console for InstantDB errors
- Ensure InstantDB permissions allow public read/write

### Real-time Updates Not Working
- Check Network tab for WebSocket connections to InstantDB
- Verify `db.subscribeQuery()` is properly configured
- Try refreshing the page

### League Not Found
- League is identified by `slug` parameter in URL
- Slug is created by lowercasing name and replacing spaces with hyphens
- Check if league exists in InstantDB dashboard
