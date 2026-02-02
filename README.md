# Super Bowl Prediction Game

A single-file HTML/JavaScript application for a family Super Bowl prediction game between Seahawks and Patriots. Features real-time leaderboard, admin controls, and mobile-first design optimized for elderly users.

## Features

- **Team Creation**: First person creates team, gets shareable URL
- **Real-time Updates**: InstantDB provides live leaderboard updates
- **15 Auto-Checkable Questions**: All predictions automatically scored
- **Admin Panel**: Toggle submissions, enter results, calculate scores
- **Mobile-First Design**: Large fonts, tap targets, high contrast
- **Seahawks Theme**: Navy, Action Green, and Wolf Grey colors

## Setup Instructions

### 1. Get InstantDB App ID

1. Go to [instantdb.com](https://instantdb.com) and sign up
2. Click "Create App"
3. Name your app (e.g., "Super Bowl Game")
4. Copy your **App ID** (looks like: `abc123-def456-...`)

### 2. Configure the App

1. Open `index.html` in a text editor
2. Find line with `const APP_ID = 'YOUR_APP_ID_HERE';`
3. Replace `YOUR_APP_ID_HERE` with your actual App ID
4. Save the file

### 3. Set InstantDB Permissions

1. In InstantDB dashboard, go to your app
2. Click on "Rules" or "Permissions"
3. Set to allow **public read/write** (this is a family game, no authentication needed)
4. Example rule (if needed):

```javascript
{
  allow: {
    gameState: "true",
    predictions: "true"
  }
}
```

### 4. Deploy to Netlify

**Option A: Drag & Drop (Easiest)**

1. Go to [netlify.com/drop](https://netlify.com/drop)
2. Drag `index.html` onto the page
3. Get your URL (e.g., `superbowl-game-123.netlify.app`)

**Option B: Netlify CLI**

```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### 5. Share Links

- **Regular Users**: `https://your-site.netlify.app`
- **Admin**: `https://your-site.netlify.app?admin=true`

## How to Use

### For Regular Users

1. Visit the base URL (sent by admin)
2. Enter your team name (e.g., "Smith Family")
3. Copy and share your team URL with family members
4. Submit predictions before admin closes submissions
5. Last submission from your team URL overwrites previous ones
6. Watch real-time leaderboard during the game

### For Admin

1. Visit the URL with `?admin=true`
2. **Tab 1 (My Predictions)**: Submit your own predictions
3. **Tab 2 (Admin Controls)**:
   - Toggle submissions open/closed
   - Enter actual game results
   - Scores automatically calculate for all teams
4. Admin appears on leaderboard with everyone else

## Game Questions (15 Total)

1. **Who wins?** (10 points) - Seahawks/Patriots
2. **TIEBREAKER: Total combined points** (0 points) - Number
3. **Total touchdowns?** (5 points) - Number
4. **Overtime?** (5 points) - Yes/No
5. **Winning margin?** (5 points) - 1-7/8-14/15+ points
6. **Total field goals?** (5 points) - Number
7. **Halftime leader?** (5 points) - Seahawks/Patriots/Tied
8. **Longest TD?** (5 points) - Under 20/20-39/40+ yards
9. **Total turnovers?** (5 points) - Number
10. **Successful 2-point conversion?** (5 points) - Yes/No
11. **Defensive/special teams TD?** (5 points) - Yes/No
12. **Final score sum even/odd?** (5 points) - Even/Odd
13. **Seahawks TDs?** (5 points) - Number
14. **Patriots TDs?** (5 points) - Number
15. **Total sacks?** (5 points) - Number

**Total Possible: 80 points**

## Scoring System

- Each correct answer awards points (5 or 10 points)
- Tiebreaker uses closest total combined points (absolute difference)
- Leaderboard sorts by:
  1. Total score (descending)
  2. Tiebreaker difference (ascending)

## Design Features

### Seahawks Theme

- Navy (#002244), Action Green (#69BE28), Wolf Grey (#A5ACAF)
- Seahawks-inspired branding

### Accessibility for Elderly Users

- **Large fonts**: 18px body, 24px headers, 32px title
- **Large tap targets**: Minimum 48px height
- **Large radio buttons**: 40px custom styled
- **High contrast**: White text on navy background
- **Generous spacing**: 24px between questions
- **Single column layout**: No complex grids
- **Clear feedback**: Hover states, visual confirmation

## Technology Stack

- **Single HTML file** with embedded CSS and JavaScript
- **Tailwind CSS** (CDN) for styling utilities
- **InstantDB** for real-time data synchronization
- **Vanilla JavaScript** (no frameworks)

## Troubleshooting

### Predictions not saving

- Check InstantDB App ID is correct in `index.html`
- Verify permissions are set to allow public read/write
- Check browser console for errors

### Real-time updates not working

- Refresh the page
- Check internet connection
- Verify InstantDB service status

### Admin panel not showing

- Ensure URL has `?admin=true` parameter
- Check URL is exactly: `https://your-site.com?admin=true`

### Team URL not working

- Team name gets converted to lowercase with dashes
- Example: "Smith Family" becomes `?team=smith-family`
- Share the exact URL shown after team creation

## Local Development

1. Open `index.html` in a web browser
2. Test with multiple browser windows
3. Use browser DevTools to inspect InstantDB queries
4. Check Network tab for real-time updates

## Support

For issues with:

- **InstantDB**: Check [instantdb.com/docs](https://instantdb.com/docs)
- **Netlify**: Check [docs.netlify.com](https://docs.netlify.com)
- **This app**: Check browser console for error messages

## License

Free to use for family fun! 🏈
