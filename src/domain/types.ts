/**
 * Core domain types for the Titan application.
 * Exported as the single source of truth for all entity shapes.
 */

export type ProjectStatus = 'on-track' | 'at-risk' | 'completed';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type NotificationKind = 'mention' | 'project' | 'system';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  dueDate: string; // ISO 8601 date
  ownerId: string;
  color: string; // hex or named color
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO 8601 date
}

export interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string; // hex or named color
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string; // ISO 8601 datetime
  kind: NotificationKind;
}

export interface Preferences {
  displayName: string;
  email: string;
  timezone: string;
  emailDigest: boolean;
  mentionAlerts: boolean;
  theme: ThemePreference;
}
