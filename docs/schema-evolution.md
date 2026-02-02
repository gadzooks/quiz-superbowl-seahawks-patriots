# Schema Evolution: Multi-Event Support

> Design document for supporting multiple Super Bowls and regular season quizzes.

## Requirements

1. **Multiple Super Bowls** - Keep historical data, support future years (LXI, LXII, etc.)
2. **Regular Season Quizzes** - Paths like `/quizzes/2025/week-5`
3. **Dynamic Event Creation** - Admin UI to create new events (not hardcoded)
4. **Different Questions Per Event** - Each quiz/Super Bowl can have unique questions

---

## Current Schema

### leagues

```typescript
interface League {
  id: string;
  gameId: string; // "lx" - partitions by Super Bowl
  name: string;
  slug: string;
  creatorId: string;
  isOpen: boolean;
  actualResults: Record<string, string | number> | null;
  showAllPredictions: boolean;
  createdAt: number;
}
```

### predictions

```typescript
interface Prediction {
  id: string;
  gameId: string; // denormalized from league
  leagueId: string;
  userId: string;
  teamName: string;
  predictions: Record<string, string | number>;
  score: number;
  tiebreakDiff: number;
  isManager: boolean;
  submittedAt: number;
}
```

**Current limitations:**

- `gameId` is just a string, no structure
- Questions hardcoded in `/src/questions.ts`
- No way to query "all quizzes from 2025"
- No event metadata stored

---

## Proposed Schema

### NEW: events

```typescript
interface Event {
  id: string; // "superbowl-lx", "quiz-2025-week5"
  type: 'superbowl' | 'quiz';
  year: number;
  week?: number; // null for superbowl
  displayName: string; // "Super Bowl LX", "Week 5 Quiz"
  path: string; // "/superbowl/lx", "/quizzes/2025/week-5"
  teams?: [string, string]; // for team-based questions (optional)
  questions: Question[]; // full question config stored here
  isActive: boolean; // visible in event picker
  createdAt: number;
}

interface Question {
  id: string; // "winner", "total-points"
  label: string; // "Who wins?"
  type: 'radio' | 'number';
  options?: string[]; // for radio buttons
  points: number;
  isTiebreaker?: boolean;
}
```

### MODIFIED: leagues

```typescript
interface League {
  id: string;
  eventId: string; // FK to events (replaces gameId)
  name: string;
  slug: string;
  creatorId: string;
  isOpen: boolean;
  actualResults: Record<string, string | number> | null;
  showAllPredictions: boolean;
  createdAt: number;
}
```

### MODIFIED: predictions

```typescript
interface Prediction {
  id: string;
  eventId: string; // denormalized from league (replaces gameId)
  leagueId: string;
  userId: string;
  teamName: string;
  predictions: Record<string, string | number>;
  score: number;
  tiebreakDiff: number;
  isManager: boolean;
  submittedAt: number;
}
```

---

## URL Routing

| URL Pattern                          | eventId           | Description          |
| ------------------------------------ | ----------------- | -------------------- |
| `/superbowl/lx?league=good-vibes`    | `superbowl-lx`    | Current flow         |
| `/superbowl/lxi?league=family`       | `superbowl-lxi`   | Future Super Bowl    |
| `/quizzes/2025/week-5?league=office` | `quiz-2025-week5` | Regular season       |
| `/events`                            | -                 | Event picker page    |
| `/admin/events`                      | -                 | Create/manage events |

---

## Query Patterns

### List all events

```typescript
db.subscribeQuery({ events: {} }, callback);
```

### List active Super Bowls

```typescript
db.subscribeQuery(
  {
    events: { $: { where: { type: 'superbowl', isActive: true } } },
  },
  callback
);
```

### List quizzes for a year

```typescript
db.subscribeQuery(
  {
    events: { $: { where: { type: 'quiz', year: 2025 } } },
  },
  callback
);
```

### Get event + league + predictions

```typescript
db.subscribeQuery(
  {
    events: { $: { where: { id: eventId } } },
    leagues: { $: { where: { eventId, slug } } },
    predictions: { $: { where: { eventId } } },
  },
  callback
);
```

---

## Options Considered

### Option 1: Structured gameId Pattern (Rejected)

Use hierarchical IDs like `superbowl/lx` or `quiz/2025/week-5`.

**Pros:** Zero schema changes, URL-friendly
**Cons:** Can't query efficiently, no type safety, questions still hardcoded

### Option 2: Add eventType + year Fields (Rejected)

Add fields to leagues/predictions without events entity.

**Pros:** Simple, backwards compatible
**Cons:** Doesn't solve dynamic questions problem, duplicates metadata per league

### Option 3: Events Entity (Selected)

New parent entity for event config + questions.

**Pros:** Single source of truth, dynamic questions, clean queries
**Cons:** More complex schema, migration needed

### Option 4: Hybrid (Considered)

Keep current schema + add events for navigation only.

**Pros:** Minimal migration
**Cons:** Two sources of truth, questions still hardcoded

---

## Why Events Entity?

1. **Questions need a single source of truth** - Can't duplicate question config across every league
2. **Events can exist without leagues** - Admin creates event, then users create leagues
3. **Clean queries** - Easy to list "all 2025 quizzes" or "all active Super Bowls"
4. **Enables event picker** - Users can browse and join different events

---

## Why Denormalize eventId on predictions?

- Query efficiency (filter predictions by event without joining leagues)
- Matches current `gameId` pattern that works well
- InstantDB doesn't have efficient joins
- Small storage overhead is acceptable

---

## Why Store Questions as JSON Array?

- Simpler than separate `questions` entity with relationships
- Questions rarely change after event creation
- Avoids complex many-to-many relationships
- Easy to clone questions when creating similar events

---

## Migration Plan

### Phase 1: Add events entity

1. Create `events` table in InstantDB
2. Seed with current Super Bowl LX data
3. Update types in `/src/types/index.ts`

### Phase 2: Update leagues/predictions

1. Add `eventId` field alongside existing `gameId`
2. Backfill `eventId` from `gameId` for existing data
3. Update queries to use both during transition

### Phase 3: Update queries

1. Modify `/src/db/queries.ts` to use `eventId`
2. Update `subscribeToLeague` to include events query
3. Pass questions from event to scoring functions

### Phase 4: Update UI components

1. Read questions from `event.questions`, not config
2. Update forms to render dynamic questions
3. Update routing to parse event paths

### Phase 5: Build event management

1. Event picker page (`/events`)
2. Admin event CRUD (`/admin/events`)
3. Question builder UI

### Phase 6: Cleanup

1. Remove `gameId` field
2. Remove hardcoded `GameConfig` and `questions.ts`
3. Update documentation

---

## Files to Modify

| File                        | Changes                                             |
| --------------------------- | --------------------------------------------------- |
| `/src/types/index.ts`       | Add `Event` interface, update `League`/`Prediction` |
| `/src/db/queries.ts`        | Add event queries, update to use `eventId`          |
| `/src/db/client.ts`         | No changes needed                                   |
| `/src/config/games.ts`      | Remove or convert to migration seed data            |
| `/src/questions.ts`         | Remove (questions come from DB)                     |
| `/src/scoring/calculate.ts` | Accept `questions` as parameter                     |
| `/src/handlers/*.ts`        | Update to use `eventId`, read questions from event  |
| `/src/state/store.ts`       | Add `currentEvent` to state                         |
| `/src/components/*.ts`      | Read questions from event                           |
| `/src/utils/url.ts`         | Parse event type from path                          |

---

## Example Event Data

### Super Bowl LX

```json
{
  "id": "superbowl-lx",
  "type": "superbowl",
  "year": 2026,
  "week": null,
  "displayName": "Super Bowl LX",
  "path": "/superbowl/lx",
  "teams": ["Seahawks", "Patriots"],
  "questions": [
    {
      "id": "winner",
      "label": "Who wins?",
      "type": "radio",
      "options": ["Seahawks", "Patriots"],
      "points": 5
    },
    { "id": "totalTDs", "label": "Total touchdowns?", "type": "number", "points": 5 },
    {
      "id": "overtime",
      "label": "Overtime?",
      "type": "radio",
      "options": ["Yes", "No"],
      "points": 5
    },
    {
      "id": "winningMargin",
      "label": "Winning margin?",
      "type": "radio",
      "options": ["1-7", "8-14", "15+"],
      "points": 5
    },
    { "id": "totalFieldGoals", "label": "Total field goals?", "type": "number", "points": 5 },
    {
      "id": "firstHalfLeader",
      "label": "Halftime leader?",
      "type": "radio",
      "options": ["Seahawks", "Patriots", "Tied"],
      "points": 5
    },
    {
      "id": "totalPoints",
      "label": "TIEBREAKER: Total combined points",
      "type": "number",
      "points": 0,
      "isTiebreaker": true
    }
  ],
  "isActive": true,
  "createdAt": 1706745600000
}
```

### Week 5 Quiz

```json
{
  "id": "quiz-2025-week5",
  "type": "quiz",
  "year": 2025,
  "week": 5,
  "displayName": "Week 5 Quiz",
  "path": "/quizzes/2025/week-5",
  "teams": null,
  "questions": [
    {
      "id": "mnf-winner",
      "label": "Monday Night Football winner?",
      "type": "radio",
      "options": ["Cowboys", "Giants"],
      "points": 10
    },
    {
      "id": "highest-scoring",
      "label": "Highest scoring game total?",
      "type": "number",
      "points": 10
    },
    {
      "id": "upsets",
      "label": "Number of upsets (underdog wins)?",
      "type": "number",
      "points": 10
    },
    {
      "id": "total-points",
      "label": "TIEBREAKER: Total points scored across all games",
      "type": "number",
      "points": 0,
      "isTiebreaker": true
    }
  ],
  "isActive": true,
  "createdAt": 1706745600000
}
```

---

## Open Questions

1. **Event archiving** - Should old events be archived or just marked `isActive: false`?
2. **Question templates** - Should we support reusable question templates for common quiz formats?
3. **Event permissions** - Who can create events? Global admin only or league creators too?
4. **Results entry** - Should results live on league (current) or move to event level?
