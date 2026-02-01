# Changelog

## 2026-01-30 - Improvements and Validations

### New Features

#### 1. Unique Team Names (Case-Insensitive)

**Location:** `index.html:752-777`

Team names must now be unique within a league (case-insensitive comparison).

**Behavior:**

- When a user submits a team name, the app checks if it already exists
- Comparison is case-insensitive: "Team One" === "team one" === "TEAM ONE"
- If duplicate found, shows alert: "This team name is already taken. Please choose a different name."
- Prevents confusion and ensures leaderboard clarity

**Implementation:**

```javascript
const teamNameExists = allPredictions.some(
  (p) => p.teamName.toLowerCase() === teamName.toLowerCase()
);
```

#### 2. Unique League Names (Case-Insensitive)

**Location:** `index.html:656-693`

League names must now be unique (via slug comparison).

**Behavior:**

- When creating a league, checks if slug already exists
- Slug is created by lowercasing name and replacing spaces with hyphens
- If duplicate found, shows alert: "A league with this name already exists. Please choose a different name."
- Prevents multiple leagues with same or similar names

**Implementation:**

```javascript
const existingLeague = await db.queryOnce({
  leagues: { $: { where: { slug: leagueSlug } } },
});
```

#### 3. Admin Override URL Parameter

**Location:** `index.html:610-614, 636`

New URL parameter `?isAdmin=true` grants admin access to anyone.

**Behavior:**

- Add `?isAdmin=true` to any league URL to get admin access
- Works alongside the league creator check
- Useful for:
  - Testing admin features
  - Multiple administrators
  - Remote support/troubleshooting
  - Delegating admin duties

**Usage:**

```
Normal user: https://site.com?league=my-league
Admin access: https://site.com?league=my-league&isAdmin=true
```

**Implementation:**

```javascript
const isAdminOverride = urlParams.get('isAdmin') === 'true';
isLeagueCreator = currentLeague.creatorId === currentUserId || isAdminOverride;
```

**Security Note:** This is intentionally simple for ease of use. The app is designed for trusted users (family/friends). For production apps with sensitive data, implement proper authentication.

### Build Process Improvements

#### 4. Environment Validation in Build

**Location:** `netlify.toml:14-56`

Build now runs validation before deploying.

**Build Command:**

```bash
node validate-netlify-env.js && npm test && node build.js
```

**Benefits:**

- Catches missing/invalid INSTANTDB_APP_ID before deploy
- Validates environment configuration
- Runs tests (when available)
- Fails fast if configuration is wrong
- Clear error messages for debugging

**Applies to all deploy contexts:**

- Production (`prod` branch)
- Branch deploys (`master`, feature branches)
- Deploy previews (pull requests)

#### 5. Improved Test Script

**Location:** `package.json:8`

Updated test command to exit cleanly.

**Before:**

```json
"test": "echo 'Open the app and go to Admin tab → Test Scoring Logic'"
```

**After:**

```json
"test": "echo 'No automated tests configured. Manual testing: Open app and go to Admin tab → Test Scoring Logic' && exit 0"
```

**Why:** Ensures `npm test` always exits with success (exit code 0) so build chain doesn't fail.

### Documentation Updates

#### 6. Updated CLAUDE.md

**Location:** `CLAUDE.md:33-43`

Added documentation for new features:

- Unique team names requirement
- Unique league names requirement
- `?isAdmin=true` URL parameter
- URL parameters section

## Testing the Changes

### Test Unique Team Names

1. Open league: `?league=test-league`
2. Enter team name: "Team One"
3. Open in new browser (or incognito)
4. Try to use: "team one" (lowercase)
5. Should show error: "This team name is already taken"

### Test Unique League Names

1. Create league: "Test League"
2. Try to create another: "test-league" or "Test League"
3. Should show error: "A league with this name already exists"

### Test Admin Override

1. Open league as non-creator: `?league=test-league`
2. Should see user panel (no admin tab)
3. Add admin parameter: `?league=test-league&isAdmin=true`
4. Should see admin panel with admin tab

### Test Build Validation

```bash
# Test full build chain
node validate-netlify-env.js && npm test && echo "Build would succeed"

# Test validation catches errors
unset INSTANTDB_APP_ID
node validate-netlify-env.js  # Should fail with clear error
```

## Migration Notes

### No Breaking Changes

All changes are backwards compatible:

- Existing teams keep their names
- Existing leagues keep their names
- No database migrations needed
- URLs work the same way

### Existing Duplicate Teams

If you already have duplicate team names (e.g., created before this update):

- They will continue to work
- New users cannot create duplicates
- Consider manually renaming duplicates for clarity

### Existing Duplicate Leagues

If you already have duplicate league slugs:

- They will continue to work
- New leagues with same slug will be blocked
- Each league has a unique ID, so they're technically separate

## Files Modified

```
Modified Files:
✓ index.html              - Added validations and isAdmin parameter
✓ netlify.toml            - Added validation to build command
✓ package.json            - Updated test script
✓ CLAUDE.md               - Documented new features
✓ CHANGELOG.md            - This file

No Breaking Changes:
✓ All changes are additive
✓ Existing data works as before
✓ No database migrations needed
```

## Future Enhancements

Potential future improvements:

1. **Automated Tests**: Add proper unit/integration tests
2. **Team Name Editing**: Allow users to change their team name (with uniqueness check)
3. **League Name Editing**: Allow creators to rename leagues (with uniqueness check)
4. **Admin Password**: Optional password for isAdmin parameter
5. **Multiple Admins**: Store list of admin user IDs in league data
6. **Validation on Frontend**: Show real-time feedback as user types team/league name

## Rollback Instructions

If you need to rollback these changes:

1. **Revert index.html changes:**

   ```bash
   git log --oneline index.html  # Find commit before changes
   git checkout <commit-hash> index.html
   ```

2. **Revert netlify.toml:**

   ```bash
   git checkout <commit-hash> netlify.toml
   ```

3. **Or revert entire commit:**
   ```bash
   git revert <commit-hash>
   ```

The app will work exactly as before with no data loss.
