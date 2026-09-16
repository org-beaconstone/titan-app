/**
 * Business logic for task operations.
 * Handles task filtering, status checks, and priority operations.
 */

import type { Task, TaskStatus } from './types';

/**
 * Determines if a task is overdue relative to a reference date.
 * Only non-completed tasks can be overdue.
 *
 * Date comparison is date-only (ignores time), using UTC semantics.
 *
 * @param task - Task to check
 * @param today - Reference date in YYYY-MM-DD format (UTC)
 * @returns true if the task is overdue (due date is before today and not done)
 *
 * @example
 * const overdue = isOverdue(task, '2026-09-15');
 */
export function isOverdue(task: Task, today: string): boolean {
  // Completed tasks are never overdue
  if (task.status === 'done') {
    return false;
  }

  // Compare date strings directly (YYYY-MM-DD format)
  return task.dueDate < today;
}

/**
 * Filters tasks by project ID.
 *
 * @param tasks - Array of tasks to filter
 * @param projectId - Project ID to match
 * @returns Filtered array of tasks
 *
 * @example
 * const projectTasks = filterTasksByProject(tasks, 'proj-1');
 */
export function filterTasksByProject(tasks: Task[], projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId);
}

/**
 * Filters tasks by assignee ID.
 *
 * @param tasks - Array of tasks to filter
 * @param assigneeId - Member ID to match
 * @returns Filtered array of tasks
 *
 * @example
 * const myTasks = filterTasksByAssignee(tasks, 'member-1');
 */
export function filterTasksByAssignee(tasks: Task[], assigneeId: string): Task[] {
  return tasks.filter((t) => t.assigneeId === assigneeId);
}

/**
 * Filters tasks by status.
 *
 * @param tasks - Array of tasks to filter
 * @param status - Task status to match
 * @returns Filtered array of tasks
 *
 * @example
 * const inProgress = filterTasksByStatus(tasks, 'in-progress');
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

/**
 * Finds overdue tasks from a collection.
 *
 * @param tasks - Array of tasks to check
 * @param today - Reference date in YYYY-MM-DD format (UTC)
 * @returns Array of overdue tasks (excluding completed tasks)
 *
 * @example
 * const overdue = findOverdueTasks(tasks, '2026-09-15');
 */
export function findOverdueTasks(tasks: Task[], today: string): Task[] {
  return tasks.filter((t) => isOverdue(t, today));
}

/**
 * Counts tasks by their status.
 *
 * @param tasks - Array of tasks to count
 * @returns Object with counts for each status
 *
 * @example
 * const counts = countTasksByStatus(tasks);
 * // { todo: 5, 'in-progress': 3, done: 2 }
 */
export function countTasksByStatus(tasks: Task[]): Record<TaskStatus, number> {
  return {
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };
}

/**
 * Sorts tasks by priority (high > medium > low) and within priority by due date.
 *
 * @param tasks - Tasks to sort
 * @returns Sorted array
 *
 * @example
 * const sorted = sortTasksByPriority(tasks);
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    // Within same priority, sort by due date (earlier first)
    return a.dueDate.localeCompare(b.dueDate);
  });
}

/**
 * Calculates progress percentage for a set of tasks.
 *
 * @param tasks - Array of tasks
 * @returns Progress percentage (0-100)
 *
 * @example
 * const progress = calculateTaskProgress(projectTasks);
 */
export function calculateTaskProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  return Math.round((completedCount / tasks.length) * 100);
}
