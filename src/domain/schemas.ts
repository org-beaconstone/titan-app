/**
 * Zod schemas for domain validation and type inference.
 * Used for form inputs, API payloads, and runtime validation.
 */

import { z } from 'zod';

/**
 * Schema for creating or updating a project.
 * Validates name, description, status, and due date.
 */
// Validate date is real YYYY-MM-DD (no Feb 30, etc) and is valid UTC
const isValidDate = (dateStr: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().startsWith(dateStr);
};

// Validate timezone using Intl.DateTimeFormat
const isValidTimezone = (tz: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// Validate hex color (6 digits)
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9a-fA-F]{6}$/.test(color);
};

export const projectInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').default(''),
  status: z.enum(['on-track', 'at-risk', 'completed'] as const).default('on-track'),
  dueDate: z.string().refine(isValidDate, 'Due date must be a valid YYYY-MM-DD date'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  color: z
    .string()
    .refine(isValidHexColor, 'Color must be a valid 6-digit hex code')
    .default('#3b82f6'),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

/**
 * Schema for creating or updating a task.
 * Validates title, status, priority, and associations.
 */
export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(255, 'Task title must be 255 characters or less'),
  projectId: z.string().min(1, 'Project ID is required'),
  assigneeId: z.string().min(1, 'Assignee ID is required'),
  status: z.enum(['todo', 'in-progress', 'done'] as const).default('todo'),
  priority: z.enum(['low', 'medium', 'high'] as const).default('medium'),
  dueDate: z.string().refine(isValidDate, 'Due date must be a valid YYYY-MM-DD date'),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

/**
 * Schema for user preferences.
 * Validates display name, email, timezone, and notification settings.
 */
export const preferencesSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(255, 'Display name must be 255 characters or less'),
  email: z.string().email('Must be a valid email address'),
  timezone: z
    .string()
    .refine(isValidTimezone, 'Timezone must be a valid IANA timezone')
    .default('UTC'),
  emailDigest: z.boolean().default(true),
  mentionAlerts: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'system'] as const).default('system'),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
