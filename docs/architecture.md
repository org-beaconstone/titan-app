# Architecture

## Overview

Titan is a frontend-only React web application demonstrating notification and task management with persistent local state. All data lives in the browser using React Context and localStorage—no backend, authentication, or external APIs.

## Core Principles

- **Frontend-Only**: React Context + localStorage, no backend
- **Demo-Focused**: Fixture data (6 projects, 12 tasks, 5 members, 5 notifications) seeded at startup
- **Type-Safe**: TypeScript strict mode, Zod runtime validation
- **Testable**: 151 unit tests + 7 e2e tests via Vitest and Playwright

## Directory Structure

```
src/
├── app/AppProvider.tsx        # Global workspace state (version 1, localStorage key)
├── domain/                    # Pure business logic and types
│   ├── schemas.ts             # Zod validation for projects, tasks, preferences
│   ├── types.ts               # Domain entity types
│   ├── task-policy.ts         # Overdue calculation (timezone-aware)
│   ├── project-policy.ts      # Project status rules
│   ├── notification-policy.ts # Read state, unread count
│   └── *.test.ts              # Unit tests for domain logic
├── features/
│   ├── dashboard/             # Overview, task counts, team roster
│   ├── projects/              # Search (page-local), status filter (page-local), create dialog
│   ├── notifications/         # Read individual, bulk mark-all-read
│   ├── settings/              # Timezone, theme, preferences
│   └── *.test.tsx             # Component tests
├── lib/storage.ts             # Validated localStorage wrapper with fallbacks
├── components/ui.tsx          # Shared primitives and date formatting
├── data/fixtures.ts           # Deterministic demo data (DEMO_TODAY = 2026-09-15 UTC)
├── main.tsx                   # React entry point
└── App.tsx                    # Routes and responsive shell
tests/e2e/                     # User journeys (Playwright)
```

## State Management

**AppProvider** manages a single versioned workspace state:

```typescript
{
  version: 1,
  projects: Project[],        // id, name, status, dueDate, progress (manually set)
  tasks: Task[],              // id, title, status, dueDate, assigneeId
  notifications: Notification[],  // id, title, body, read, createdAt, kind
  preferences: Preferences    // timezone, theme, displayName, email, etc.
}
```

**Storage**:

- Key: `titan.workspace.v1`
- Validated via Zod on load; corrupted data triggers fallback to fixtures
- Persisted on every state change (synchronous)
- Scoped to single browser tab; no cross-tab sync

**Mutations** (via `useApp()`):

- `toggleTask(id)`: flip status between todo ↔ done
- `readNotification(id)`: mark single notification read
- `readAll()`: mark all notifications read
- `addProject(input)`: create and prepend project; progress defaults to 0 (or 100 if completed)
- `savePreferences(input)`: replace entire preferences object
- `reset()`: clear storage and reload fixtures

## Feature Modules

### Dashboard

- Overview of unread notification count, task completion status, project health
- Team roster and active members
- Navigation header shows unread badge (persists across routes)

### Projects

- **Search**: text-based, page-local, not persistent (cleared on reload)
- **Status filter**: single or multi-select (page-local, not persistent)
- **Create dialog**: validated form (Zod), creates real project in state

### Notifications

- List of all notifications with read/unread visual state
- Individual notification mark-read
- Bulk mark-all-read action
- Timestamps display in user's selected timezone

### Settings

- **Profile**: display name, email (saved to preferences)
- **Theme**: light / dark / system (applies to document immediately)
- **Timezone**: IANA string (affects notification timestamps only; task due dates are calendar dates, not affected by timezone)
- **Reset**: restore default state and clear localStorage

## Demo Data & Overdue Logic

Fixture file provides:

- 6 projects (on-track, at-risk, completed)
- 12 tasks with due dates
- 5 team members
- 5 notifications (mixed read/unread)
- Demo reference date: **2026-09-15 UTC** (`DEMO_TODAY`)

**Overdue task** logic:

- Compares calendar date (YYYY-MM-DD) against demo reference date in user's timezone
- Example: task due 2026-09-10, user in UTC+2, reference date 2026-09-15 → overdue
- Timezone preference does NOT affect task due dates (they remain calendar dates); only notification timestamps shift

## Testing Strategy

- **Unit tests (Vitest)**: domain logic, schemas, policies (~151 tests)
- **Component tests (Vitest)**: rendering, mutations, side effects
- **E2E tests (Playwright)**: task persistence, inbox bulk-read, project create/search, preferences, mobile navigation, corrupted state recovery (~7 tests)
