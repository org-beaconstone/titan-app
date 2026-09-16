# Titan App - Domain Layer API

Complete data/domain layer built for React 19 + TypeScript 5.7 + Vite with **~151 unit tests** (all passing).

## Files Overview

### Types & Schemas

- **`src/domain/types.ts`** — Core entity types
  - `Project`, `Task`, `Member`, `Notification`, `Preferences`
  - Type aliases for statuses and enums

- **`src/domain/schemas.ts`** — Zod input validation
  - `projectInputSchema` → validates name, description, status, dueDate, ownerId, color
  - `taskInputSchema` → validates title, projectId, assigneeId, status, priority, dueDate
  - `preferencesSchema` → validates displayName, email, timezone, theme, notification settings

### Business Logic (Policy)

- **`src/domain/project-policy.ts`**
  - `filterProjects(projects, query, status?)` — search & status filter
  - `getDashboardMetrics(projects, tasks, today?)` — KPI counts
  - `isProjectAtRisk(project)` — status check
  - `sortProjectsByPriority(projects)` — at-risk first, then on-track, completed

- **`src/domain/task-policy.ts`**
  - `isOverdue(task, today)` — date-only UTC, ignores done tasks
  - `filterTasksByProject(tasks, projectId)`, `filterTasksByAssignee(tasks, assigneeId)`, `filterTasksByStatus(tasks, status)`
  - `findOverdueTasks(tasks, today)` — excludes done
  - `countTasksByStatus(tasks)` → { todo, in-progress, done }
  - `sortTasksByPriority(tasks)` — high > medium > low, then by dueDate
  - `calculateTaskProgress(tasks)` → percentage

- **`src/domain/notification-policy.ts`** (all pure functions)
  - `unreadCount(notifications)` → number
  - `markAllRead(notifications)` → new array
  - `markAsRead(notifications, notificationId)` → new array
  - `filterByKind(notifications, kind)`, `filterByReadStatus(notifications, read)`
  - `sortByDate(notifications)` — newest first
  - `groupByKind(notifications)` → { mention, project, system }
  - `removeNotification(notifications, id)` → new array

### Data & Fixtures

- **`src/data/fixtures.ts`**
  - `DEMO_TODAY = '2026-09-15'` — reference date (UTC)
  - `members` — 5 demo members
  - `projects` — 6 projects with mixed statuses
  - `tasks` — 12 tasks across projects
  - `notifications` — 5 notifications (mixed read/unread, kinds)
  - `defaultPreferences` — default user preferences

### Storage

- **`src/lib/storage.ts`**
  - `loadStored<T>(key, fallback, validate?)` → T
    - Guards against non-browser env, JSON errors, validation failures
  - `saveStored<T>(key, value)` → boolean
  - `removeStored(key)` → boolean
  - `clearAllStored()` → boolean

## Test Coverage

- **~151 unit tests** across domain, schemas, and storage modules (all passing)
- Organized by `*.test.ts` files co-located with source
- Focus: timezone-aware overdue logic, Zod validation, localStorage fallback, edge cases
- Goal: domain logic 90%+ coverage

Run: `npm test` or `npm run test:watch`

## Usage Examples

```typescript
import { filterProjects, getDashboardMetrics } from '@/domain/project-policy';
import { isOverdue, calculateTaskProgress } from '@/domain/task-policy';
import { unreadCount, markAllRead } from '@/domain/notification-policy';
import { loadStored, saveStored } from '@/lib/storage';
import { projects, tasks, members, notifications, defaultPreferences } from '@/data/fixtures';
import { projectInputSchema, preferencesSchema } from '@/domain/schemas';

// Filter on-track projects matching "dashboard"
const results = filterProjects(projects, 'dashboard', 'on-track');

// Get workspace KPIs
const metrics = getDashboardMetrics(projects, tasks, '2026-09-15');
// { totalProjects: 5, completedProjects: N, atRiskProjects: N, onTrackProjects: N, ... }

// Find overdue work
const overdue = tasks.filter((t) => isOverdue(t, '2026-09-15'));

// Notification management (pure)
const unread = unreadCount(notifications);
const updated = markAllRead(notifications);

// Persist preferences with validation
const validated = preferencesSchema.safeParse(userInput);
if (validated.success) {
  saveStored('user-prefs', validated.data);
}

// Retrieve with fallback
const prefs = loadStored('user-prefs', defaultPreferences);
```

## Type Safety

- Strict `tsconfig.json` with `strict: true`
- Zod schemas provide runtime validation + TypeScript type inference
- TypeGuard pattern for `loadStored` validation
- All functions documented with JSDoc

## Key Design Patterns

1. **Pure Functions** — All policy functions are deterministic, no side effects
2. **Immutability** — All array transformations return new arrays, never mutate input
3. **Type Guards** — Zod schemas + custom TypeGuard for validation
4. **Safe Storage** — Guards against non-browser env, JSON errors, quota issues
5. **Date Handling** — ISO 8601 strings (YYYY-MM-DD), date-only UTC comparisons
6. **Composition** — Policies layer on top of types; tests are independent

## No UI Code

This layer is **UI-agnostic**. No React imports, hooks, or component logic.
Safe to use in Node, Electron, mobile, or any TypeScript environment.
