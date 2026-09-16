# Demo Scenarios

This document outlines key user workflows and implemented features. Engineering candidates can trace each scenario through the code: UI → context mutation → domain policy → fixtures → tests.

## Scenario 1: Inbox Mark-All-Read

**Goal**: Demonstrate notification state management and persistence

**User Journey**:

1. User sees inbox badge showing unread count (e.g., "3") in header across all routes
2. User navigates to Notifications page, sees full list with read/unread visual state
3. User marks individual notification as read → unread count updates immediately in header
4. User clicks "mark all as read" → all notifications marked, counter resets to 0
5. User reloads page → read state persists; badge shows "0"

**Acceptance Criteria** (implemented):

- Unread count calculated from `notifications.filter(n => !n.read).length`
- Individual read state persists to `titan.workspace.v1` localStorage
- Bulk mark-all-read action (`readAll()`) applies `markAllRead()` domain policy
- Navigation header reflects unread count across all routes (via context)
- E2E test verifies round-trip: navigate → read → reload → persisted

**Code Trace**:

- UI: `NotificationsPage` calls `useApp().readNotification(id)` and `readAll()`
- Context: `AppProvider.tsx` mutation sets `notifications.map(n => ({ ...n, read: true }))`
- Storage: `loadStored()` validates via Zod, fallback to fixtures if corrupted
- Domain: `unreadCount()` in `notification-policy.ts`
- Tests: `notification-policy.test.ts`, `workspace.spec.ts` (e2e)

---

## Scenario 2: Task Status Toggle & Overdue Awareness

**Goal**: Demonstrate task mutations and timezone-aware overdue calculation

**User Journey**:

1. User sees task list on dashboard with overdue indicators
2. Overdue status is calculated from task due date vs. demo reference date (2026-09-15)
3. User completes a task → status changes from "todo" to "done"
4. Task completion does NOT change project progress (progress is manually curated via `progress` field)
5. User changes timezone in Settings → notification timestamps shift; task due dates (calendar dates) do NOT shift
6. User reloads page → task status and timezone preference persist

**Acceptance Criteria** (implemented):

- Demo reference date fixed to 2026-09-15 UTC (in fixtures)
- Overdue calculation: `new Date(task.dueDate) < today` in user's timezone
- Task toggle: `toggleTask(id)` flips `status` between "todo" and "done"
- Completing a task does NOT auto-update project progress
- Timezone preference affects ONLY `createdAt` timestamp display, not due dates
- Task state and preferences persisted to `titan.workspace.v1`

**Code Trace**:

- UI: `DashboardPage` displays tasks; checkbox calls `useApp().toggleTask(id)`
- Context: mutation maps task and updates `status` field
- Domain: `isTaskOverdue()` in `task-policy.ts` compares YYYY-MM-DD strings + timezone
- Fixtures: 11 sample tasks with various due dates (see `fixtures.ts`)
- Tests: `task-policy.test.ts` covers timezone edge cases; e2e covers persistence

---

## Scenario 3: Project Creation & Page-Local Search

**Goal**: Demonstrate form validation, state mutation, and search scope

**User Journey**:

1. User navigates to Projects page
2. User enters search text (e.g., "planning") → list filters in real-time (page-local)
3. User clicks "Create Project" → validated dialog opens
4. User fills form: name (required), status (required), due date (required, YYYY-MM-DD)
5. User submits → new project prepended to list, progress defaults to 0 (or 100 if status=completed)
6. User reloads page → newly created project persists; search field is cleared (page-local, not persistent)

**Acceptance Criteria** (implemented):

- Project creation uses Zod `projectInputSchema` (validates name, status, dueDate)
- New project gets `id: crypto.randomUUID()` and initial `progress`
- Search filter is React local state (cleared on reload)
- Status filter is also page-local (not persistent)
- Project list persists to `titan.workspace.v1`

**Code Trace**:

- UI: `ProjectsPage` manages local state for search/filter; form calls `useApp().addProject(input)`
- Context: validates input via `projectInputSchema.parse()`, generates UUID, prepends to list
- Schemas: `projectInputSchema` with Zod refinement for YYYY-MM-DD validation
- Fixtures: 5 sample projects in `fixtures.ts`
- Tests: `project-policy.test.ts` for business rules; e2e for create + persistence

---

## Scenario 4: Preference Persistence & Theme Application

**Goal**: Demonstrate preference mutations and immediate DOM application

**User Journey**:

1. User opens Settings page
2. User selects timezone (e.g., Europe/London) → dropdown updates
3. User selects theme (light / dark / system) → document.documentElement.dataset.theme updates immediately
4. User edits display name → form field updates
5. User saves → all preferences written to `titan.workspace.v1`
6. User reloads page → preferences and theme persist

**Acceptance Criteria** (implemented):

- Preferences saved via `savePreferences()` (replaces entire object)
- Theme applied to `document.documentElement.dataset.theme` on change
- System theme tracked via `matchMedia('(prefers-color-scheme: dark)')`
- Timezone validated as IANA string via Zod
- Notification timestamps render in selected timezone; task due dates unaffected
- Reset button clears localStorage key and reloads fixtures

**Code Trace**:

- UI: `SettingsPage` form calls `useApp().savePreferences(input)`
- Context: `useEffect` listens to theme preference, applies to DOM
- Schemas: `preferencesSchema` with Zod timezone validation
- Storage: validated on load via type guard
- Tests: preferences mutation tested in e2e and unit tests

---

## Acceptance Criteria Summary (Existing Behavior)

✅ Notification read state is persistent and updates in real-time across routes  
✅ Task completion toggle works; does not auto-update project progress  
✅ Project creation validates inputs and persists  
✅ Search and status filters are page-local (cleared on reload)  
✅ Preferences (timezone, theme) persist and apply immediately  
✅ Timezone affects notification timestamps only, not task due dates  
✅ Corrupted localStorage falls back to fixtures gracefully  
✅ Responsive layout works on mobile and desktop

---

## Future Enhancement Tickets (Not Implemented)

### 1. Notification Batching & Snooze

**Description**: Allow users to batch notifications and snooze them for later.

**User Story**: As a user, I want to snooze a notification for 1 hour so I can deal with it later without losing it.

**Scope**: Add `snoozedUntil?: string` (ISO timestamp) field to `Notification` type. Implement `snoozeNotification(id, duration)` mutation. Filter notifications UI to exclude snoozed items. Add snooze quick-action buttons (1h, 4h, tomorrow) to notification item. Requires UI timer to re-surface notifications.

---

### 2. Due Date Policy & Task Overdue Warnings

**Description**: Allow admins to define organizational due-date policies (e.g., tasks must have due dates, projects must complete by quarter end).

**User Story**: As an admin, I want to enforce that all tasks have a due date so the team can plan capacity.

**Scope**: Add `dueDateRequired: boolean` and `defaultDueDate?: string` to organization settings (new entity). Implement `validateTaskAgainstPolicy()` domain function. Add policy enforcement in project/task creation dialogs. Add warning UI when task lacks due date. Requires new Preferences field for org-level settings.

---

### 3. Filter URL Persistence

**Description**: Encode project search and status filters in URL query params so filters survive page reload and can be shared.

**User Story**: As a user, I want to bookmark a link showing only active projects so my colleague can see the same filtered view.

**Scope**: Migrate page-local filter state to URL (e.g., `/projects?search=planning&status=on-track`). Parse query params on mount. Update filters on URL change (via `useSearchParams`). Add URL-sync tests in e2e. Note: this makes filter state **persistent** across reload, unlike current behavior.

---

### 4. Cross-Tab Preference Sync

**Description**: Sync preferences and workspace state across multiple browser tabs in real-time.

**User Story**: As a user with multiple tabs open, I want theme changes in one tab to instantly apply to all tabs.

**Scope**: Add `storage` event listener to detect localStorage changes in other tabs. On change event, validate and merge state (conflict resolution: newer timestamp wins). Update context state. Add retry logic for race conditions. E2E test requires multiple Playwright browser contexts. Note: this requires architectural change from single-tab state to multi-tab coordination.

---

## Engineering Search Example

**Ticket**: "The inbox badge needs a mark-all-read action that works across pages."

**Answer**: This is implemented. Navigate to code via:

1. **UI entry point**: `NotificationsPage.tsx` → `<button onClick={() => useApp().readAll()}>`
2. **Mutation**: `AppProvider.tsx` → `readAll()` calls `markAllRead(state.notifications)`
3. **Domain logic**: `notification-policy.ts` → `markAllRead()` maps all notifications with `read: true`
4. **State shape**: `AppProvider.tsx` state schema shows `notifications: Notification[]`
5. **Persistence**: `loadStored()` validates via Zod, `saveStored()` called on every state change
6. **Navigation**: `App.tsx` routes and header show unread count from context
7. **Tests**: `notification-policy.test.ts` (unit), `workspace.spec.ts` (e2e with reload)
