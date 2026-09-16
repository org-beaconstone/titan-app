import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';
import * as fixtures from '../data/fixtures';
import {
  preferencesSchema,
  projectInputSchema,
  taskInputSchema,
  type ProjectInput,
} from '../domain/schemas';
import type { Project, Task, Notification, Preferences } from '../domain/types';
import { markAllRead, unreadCount } from '../domain/notification-policy';
import { loadStored, saveStored } from '../lib/storage';

const stateSchema = z.object({
  version: z.literal(1),
  projects: z.array(
    projectInputSchema.extend({ id: z.string(), progress: z.number().min(0).max(100) }),
  ),
  tasks: z.array(taskInputSchema.extend({ id: z.string() })),
  notifications: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      body: z.string(),
      read: z.boolean(),
      createdAt: z.string(),
      kind: z.enum(['mention', 'project', 'system']),
    }),
  ),
  preferences: preferencesSchema,
});
export interface WorkspaceState {
  version: 1;
  projects: Project[];
  tasks: Task[];
  notifications: Notification[];
  preferences: Preferences;
}
const initialState = (): WorkspaceState => ({
  version: 1,
  projects: structuredClone(fixtures.projects),
  tasks: structuredClone(fixtures.tasks),
  notifications: structuredClone(fixtures.notifications),
  preferences: { ...fixtures.defaultPreferences },
});
export const STORAGE_KEY = 'titan.workspace.v1';
interface WorkspaceContext {
  state: WorkspaceState;
  unread: number;
  storageAvailable: boolean;
  toggleTask: (id: string) => void;
  readNotification: (id: string) => void;
  readAll: () => void;
  addProject: (input: ProjectInput) => void;
  savePreferences: (input: Preferences) => void;
  reset: () => void;
}
const Context = createContext<WorkspaceContext | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(() =>
    loadStored(
      STORAGE_KEY,
      initialState(),
      (v): v is WorkspaceState => stateSchema.safeParse(v).success,
    ),
  );
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    setStorageAvailable(saveStored(STORAGE_KEY, state));
  }, [state]);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        state.preferences.theme === 'system'
          ? media.matches
            ? 'dark'
            : 'light'
          : state.preferences.theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [state.preferences.theme]);
  return (
    <Context.Provider
      value={{
        state,
        storageAvailable,
        unread: unreadCount(state.notifications),
        toggleTask: (id) =>
          setState((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t,
            ),
          })),
        readNotification: (id) =>
          setState((s) => ({
            ...s,
            notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          })),
        readAll: () => setState((s) => ({ ...s, notifications: markAllRead(s.notifications) })),
        addProject: (input) => {
          const p = projectInputSchema.parse(input);
          setState((s) => ({
            ...s,
            projects: [
              { ...p, id: crypto.randomUUID(), progress: p.status === 'completed' ? 100 : 0 },
              ...s.projects,
            ],
          }));
        },
        savePreferences: (input) => {
          const p = preferencesSchema.parse(input);
          setState((s) => ({ ...s, preferences: p }));
        },
        reset: () => {
          const fresh = initialState();
          saveStored(STORAGE_KEY, fresh); // Persist before the settings screen reloads.
          setState(fresh);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
// This hook is the only supported UI entry point for workspace mutations.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('useApp requires AppProvider');
  return value;
}
