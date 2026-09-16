# Testing

## Overview

Titan uses a three-tier testing strategy:

1. **Unit Tests** (Vitest): Domain logic and utilities
2. **Component Tests** (Vitest): React component rendering and interactions
3. **E2E Tests** (Playwright): Full user workflows

## Running Tests

```bash
# Unit and component tests
npm run test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# All checks (lint, type-check, test)
npm run check
```

## Unit Tests

Located in `src/**/*.test.ts` files (approximately 151 tests across domain and utility modules).

**Focus areas**:

- Domain logic in `src/domain/*`: schemas validation, task overdue calculation, notification policies, project status rules
- Storage utilities: load/save/fallback behavior with Zod type guards
- Business rule edge cases (e.g., timezone-aware due dates, leap years, invalid dates)

**Example**:

```typescript
// src/domain/task-policy.test.ts
describe('isTaskOverdue', () => {
  it('should account for user timezone when comparing due date to demo reference', () => {
    const task = { dueDate: '2026-09-10' };
    const timezone = 'America/Los_Angeles'; // UTC-7 in September
    expect(isTaskOverdue(task, timezone)).toBe(true); // Sept 10 is before Sept 15 in all zones
  });
});
```

**Running**:

```bash
npm run test          # Run all tests once
npm run test:watch   # Interactive watch mode
```

## Component Tests

Vitest component tests are co-located alongside components (e.g., `DashboardPage.test.tsx`).

**Focus areas**:

- Component rendering with AppProvider context
- User interactions (checkbox toggle, button clicks, form submission)
- State mutations via `useApp()` hook
- Side effects (theme application, localStorage writes)
- Accessibility (focus management, labels, semantic HTML)

Note: Components are tested primarily via e2e (Playwright) due to Context dependency; unit tests focus on domain logic.

---

## E2E Tests

Located in `tests/e2e/` directory (approximately 7 test cases covering core workflows).

**Test structure** (`workspace.spec.ts`):

```typescript
// tests/e2e/workspace.spec.ts
test('user can mark all notifications as read and persist across reload', async ({ page }) => {
  await page.goto('/');
  // Navigate to notifications, verify count
  await page.click('text=Notifications');
  await expect(page.locator('[data-testid="unread-count"]')).toContainText('3');

  // Mark all as read
  await page.click('text=Mark all as read');
  await expect(page.locator('[data-testid="unread-count"]')).toContainText('0');

  // Reload and verify persistence
  await page.reload();
  await expect(page.locator('[data-testid="unread-count"]')).toContainText('0');
});
```

**Coverage**:

- ✅ Task toggle and persistence across reload
- ✅ Notification mark-read and inbox count updates
- ✅ Project creation with form validation
- ✅ Project search (page-local)
- ✅ Preferences save and theme application
- ✅ Corrupted localStorage recovery (fallback to fixtures)
- ✅ Mobile navigation and responsive layout

**Running**:

```bash
npx playwright install chromium  # One-time setup
npm run test:e2e                 # Run all e2e tests
npx playwright test --headed     # Run with visible browser
npx playwright test --debug      # Step through with inspector
```

## Best Practices

### Naming Conventions

- Test files: `{Component}.test.tsx` or `{utility}.test.ts`
- Test suites: `describe('ComponentName or functionName', ...)`
- Individual tests: `it('should [expected behavior]', ...)`

### Fixtures and Mocks

Use `src/data/fixtures.ts` for test data:

```typescript
import { createMockNotification } from '@/data/fixtures';

const notification = createMockNotification({ read: false });
```

### Async Testing

Always await async operations:

```typescript
it('should load data', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### Accessibility Testing

Include a11y assertions:

```typescript
it('should have accessible form', () => {
  const { container } = render(<Form />)
  expect(container).toBeAccessible()
})
```

## Debugging Tests

### Vitest

```bash
# Debug in browser
node --inspect-brk ./node_modules/vitest/vitest.mjs run

# Verbose output
npm run test -- --reporter=verbose
```

### Playwright

```bash
# Run with headed browser
npx playwright test --headed

# Debug mode (pause and step through)
npx playwright test --debug

# Show trace
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Commits to `main` and `develop` branches

See `.github/workflows/ci.yml` for pipeline configuration.
