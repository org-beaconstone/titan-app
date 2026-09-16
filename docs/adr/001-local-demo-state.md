# ADR 001: Local Demo State Management

**Date**: 2026-09-15  
**Status**: Accepted  
**Context**: Build a demo application that showcases notification, task, and project management features without requiring backend infrastructure.

## Problem

We need a way to manage application state (notifications, tasks, projects, settings) that:

- Does not require a backend API
- Persists user preferences across page reloads
- Allows realistic demo scenarios with fixture data
- Remains simple and understandable for onboarding engineers

## Decision

Use React Context API for global state management with localStorage for persistence. State is versioned and validated via Zod on load. Initial state is seeded from fixture data in `src/data/fixtures.ts`.

### Implementation Details

1. **AppProvider** (`src/app/AppProvider.tsx`): Single context managing workspace state:

   ```typescript
   {
     version: 1,
     projects: Project[],       // with id, name, status, dueDate, progress (manually curated)
     tasks: Task[],             // with id, title, status, dueDate, assigneeId
     notifications: Notification[],  // with id, title, body, read, createdAt, kind
     preferences: Preferences   // displayName, email, timezone, theme
   }
   ```
   - Mutations are synchronous, state updates trigger localStorage save
   - Context exposes `useApp()` hook for UI mutations
   - Mutation interface: `toggleTask(id)`, `readNotification(id)`, `readAll()`, `addProject(input)`, `savePreferences(input)`, `reset()`

2. **Fixture Data** (`src/data/fixtures.ts`): Deterministic demo data
   - 6 projects (on-track, at-risk, completed)
   - 12 tasks with various due dates
   - 5 team members
   - 5 notifications (mixed read/unread)
   - Demo reference date: 2026-09-15 UTC (`DEMO_TODAY`)
   - Fixtures are cloned and reused on every app start or reset

3. **localStorage**: Persists mutations between page reloads
   - Key: `titan.workspace.v1`
   - Validated via Zod `stateSchema` on load; corrupted data triggers fallback to fixtures
   - Non-persistent state: project search filter, status filter (page-local)
   - Cleared by user via Settings → Reset button

## Alternatives Considered

1. **Redux**: Overkill for demo application; adds unnecessary complexity
2. **Zustand**: Good alternative; Context was chosen for zero external dependencies
3. **Backend API**: Would require infrastructure setup; defeats purpose of quick demo

## Consequences

**Positive**:

- No backend dependencies
- Fast setup and iteration
- Easy to understand for new engineers
- Persistence works immediately
- Small bundle size

**Negative**:

- Not suitable for multi-tab sync (each tab has independent state)
- No real-time collaboration
- Limited to localStorage capacity (~5MB)
- All data lost on browser cache clear (unless explicitly saved)

## Future Migration

If this evolves into a production app:

1. Extract domain logic from `src/domain/*` files
2. Add API client layer in `src/api/`
3. Replace localStorage with server-side persistence
4. Adopt Redux or Zustand for complex state management
5. Add real-time sync via WebSocket
