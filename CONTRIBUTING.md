# Contributing to Titan

Thank you for your interest in contributing to Titan! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/lestrada/titan-app.git
cd titan-app

# Install dependencies
npm ci

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## Development Workflow

### Branch Naming

Use conventional branch names:

- `feature/description-of-feature`
- `fix/description-of-bug`
- `docs/description-of-doc-update`
- `refactor/description-of-refactor`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add notification unread counter
fix: correct timezone handling in task due date
docs: update architecture guide
test: add E2E test for bulk mark read
```

### Code Quality

Before pushing, ensure all checks pass:

```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run type-check

# Run all checks
npm run check

# Run tests
npm run test
```

## Project Structure

```
src/
├── app/AppProvider.tsx        # Global workspace state, mutations, persistence
├── domain/                    # Pure business logic (policies, validation, schemas)
│   ├── types.ts               # Entity types (Project, Task, Notification, Preferences)
│   ├── schemas.ts             # Zod validation (projectInputSchema, taskInputSchema, preferencesSchema)
│   ├── *-policy.ts            # Domain functions (isTaskOverdue, unreadCount, etc.)
│   └── *.test.ts              # ~151 unit tests
├── features/                  # Feature pages and layouts
│   ├── dashboard/
│   ├── projects/              # Search (page-local), create dialog
│   ├── notifications/         # Read state UI
│   ├── settings/              # Preferences form
│   └── *.test.tsx             # Component tests (via AppProvider context)
├── lib/storage.ts             # localStorage wrapper (loadStored, saveStored with fallbacks)
├── data/fixtures.ts           # Deterministic demo data (6 projects, 12 tasks, 5 members, 5 notifications)
├── components/ui.tsx          # Shared UI primitives and date formatting
├── App.tsx                    # Routes and responsive shell
└── main.tsx                   # React entry point
tests/e2e/workspace.spec.ts   # ~7 user-journey tests (Playwright)
```

## Adding a New Feature

1. **Define types** in `src/domain/types.ts` (if new entity)
2. **Add Zod schema** in `src/domain/schemas.ts` for validation
3. **Create domain logic** in `src/domain/my-policy.ts` (pure functions, testable without context)
4. **Add domain tests** in `src/domain/my-policy.test.ts` (unit tests)
5. **Create feature page** in `src/features/my-feature/MyFeaturePage.tsx` (calls `useApp()` hook)
6. **Wire routing** in `src/App.tsx`
7. **Update AppProvider** in `src/app/AppProvider.tsx` if new mutations needed:
   - Add field to `WorkspaceState`
   - Add mutation function to context value
   - Expose via `useApp()` hook
8. **Add fixture data** in `src/data/fixtures.ts` for demo
9. **Add e2e test** in `tests/e2e/workspace.spec.ts` for user workflow
10. **Document** in `docs/demo-scenarios.md` with code trace (UI → context → domain → tests)

## Mutation Model

All state changes flow through `AppProvider.tsx`:

```typescript
// UI component calls useApp() hook
const { state, toggleTask, readNotification, savePreferences } = useApp()

// Hook wraps setState() with validation (Zod parse)
// and triggers synchronous localStorage save
export function useApp() {
  const [state, setState] = useState<WorkspaceState>(...)

  useEffect(() => {
    saveStored(STORAGE_KEY, state)  // Persisted on every mutation
  }, [state])

  return {
    toggleTask: id => setState(s => ({ ...s, tasks: ... })),
    readNotification: id => setState(s => ({ ...s, notifications: ... })),
    // ...
  }
}
```

**Key invariants**:

- Mutations are synchronous (no promises, no async actions)
- Every mutation validates input via Zod (`parse()` not `safeParse()`)
- State updates trigger localStorage save immediately
- Corrupted storage falls back to fixtures gracefully
- Page-local state (search filters) is React local state, not persisted

## Testing Requirements

All changes should include:

1. **Unit tests** (domain logic, ~151 existing):

   ```bash
   npm run test
   ```
   - Test pure domain functions in isolation (no React, no context)
   - Focus on edge cases (timezones, invalid dates, schema validation)
   - Use fixtures from `src/data/fixtures.ts`

2. **E2E tests** (user journeys, ~7 existing):

   ```bash
   npm run test:e2e
   ```
   - Test round-trip: UI interaction → state mutation → persistence → reload
   - Use Playwright assertions on real DOM
   - Include acceptance criteria from `docs/demo-scenarios.md`

3. **Coverage targets**:
   - Domain logic: 90%+
   - Overall: 75%+

Run all checks before pushing:

```bash
npm run check
```

## Documentation

Update relevant documentation:

- `docs/architecture.md`: If changing architecture
- `docs/demo-scenarios.md`: If adding user workflows
- `docs/testing.md`: If changing test strategy
- `docs/adr/`: Create ADR for significant decisions
- Inline code comments: For complex logic

## Pull Requests

1. **Before opening PR**:
   - Run `npm run check` and ensure it passes
   - Run `npm run test` and ensure coverage is acceptable
   - Update documentation as needed

2. **PR Description**:
   - Clear title following Conventional Commits
   - Description of changes and motivation
   - Acceptance criteria from `docs/demo-scenarios.md` if applicable
   - Screenshots or videos for UI changes

3. **Code Review**:
   - All checks must pass
   - At least one approval required
   - Address feedback and push new commits

## Common Tasks

### Adding a New Route

```typescript
// src/App.tsx
import MyPage from '@/features/my-feature/MyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/my-feature" element={<MyPage />} />
    </Routes>
  )
}
```

### Adding Fixture Data

```typescript
// src/data/fixtures.ts
export function createMockMyItem(overrides: Partial<MyItem> = {}): MyItem {
  return {
    id: 'my-item-1',
    name: 'Sample Item',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
```

### Adding a Domain Function

```typescript
// src/domain/my-policy.ts
export function myBusinessRule(input: Input): Output {
  // Implementation
  return result;
}

// src/domain/my-policy.test.ts
describe('myBusinessRule', () => {
  it('should return expected output', () => {
    expect(myBusinessRule(input)).toEqual(expected);
  });
});
```

## Debugging

### Browser DevTools

- Open `http://localhost:5173`
- Press F12 to open DevTools
- Use React DevTools extension for state inspection
- Check localStorage under Application tab

### VSCode Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "chrome",
  "request": "attach",
  "name": "Attach Chrome",
  "port": 9222,
  "pathMapping": {
    "/": "${workspaceRoot}/",
    "/src/": "${workspaceRoot}/src/"
  }
}
```

### Console Logging

Use `console.log()` liberally; they'll appear in browser console and test output.

## Performance Considerations

- Use React.memo for expensive components
- Implement useCallback for event handlers passed to children
- Monitor bundle size: `npm run build`
- Use Lighthouse for performance audits

## Accessibility

- Use semantic HTML elements
- Include `aria-*` attributes for interactive elements
- Test with keyboard navigation
- Use axe DevTools extension for automated checks

## Questions?

Open an issue or discussion on GitHub, or reach out to the maintainers directly.
