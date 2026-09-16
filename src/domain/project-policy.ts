/**
 * Business logic for project operations.
 * Handles filtering, metrics calculation, and project-related queries.
 */

import type { Project, Task, ProjectStatus } from './types';

/**
 * Filters projects by search query and optional status.
 *
 * @param projects - Array of projects to filter
 * @param query - Search string to match against project name and description
 * @param status - Optional status filter ('all' for no filter)
 * @returns Filtered array of projects
 *
 * @example
 * const results = filterProjects(projects, 'dashboard', 'on-track');
 */
export function filterProjects(
  projects: Project[],
  query: string,
  status: ProjectStatus | 'all' = 'all',
): Project[] {
  const normalizedQuery = query.toLowerCase().trim();

  return projects.filter((project) => {
    // Filter by status if specified
    if (status !== 'all' && project.status !== status) {
      return false;
    }

    // If no query, include the project (already passed status filter)
    if (!normalizedQuery) {
      return true;
    }

    // Match against name and description
    const nameMatch = project.name.toLowerCase().includes(normalizedQuery);
    const descriptionMatch = project.description.toLowerCase().includes(normalizedQuery);

    return nameMatch || descriptionMatch;
  });
}

/**
 * Metrics for a set of projects and tasks.
 */
export interface DashboardMetrics {
  totalProjects: number;
  completedProjects: number;
  atRiskProjects: number;
  onTrackProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageProgress: number;
}

/**
 * Calculates dashboard metrics from projects and tasks.
 * Provides high-level KPIs for the workspace overview.
 *
 * @param projects - Array of all projects
 * @param tasks - Array of all tasks
 * @param today - Reference date in YYYY-MM-DD format (defaults to today)
 * @returns Computed metrics object
 *
 * @example
 * const metrics = getDashboardMetrics(projects, tasks, '2026-09-15');
 */
export function getDashboardMetrics(
  projects: Project[],
  tasks: Task[],
  today: string = new Date().toISOString().split('T')[0],
): DashboardMetrics {
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const atRiskProjects = projects.filter((p) => p.status === 'at-risk').length;
  const onTrackProjects = projects.filter((p) => p.status === 'on-track').length;

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const overdueTasks = tasks.filter((t) => {
    // Only non-completed tasks can be overdue
    if (t.status === 'done') return false;
    return t.dueDate < today;
  }).length;

  const totalProgress =
    projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0;

  return {
    totalProjects: projects.length,
    completedProjects,
    atRiskProjects,
    onTrackProjects,
    totalTasks: tasks.length,
    completedTasks,
    overdueTasks,
    averageProgress: Math.round(totalProgress),
  };
}

/**
 * Determines if a project is at risk based on its status and progress.
 * Useful for visual indicators and alerting.
 *
 * @param project - Project to evaluate
 * @returns true if the project is at risk
 */
export function isProjectAtRisk(project: Project): boolean {
  return project.status === 'at-risk';
}

/**
 * Sorts projects by priority (at-risk first, then on-track, then completed).
 *
 * @param projects - Projects to sort
 * @returns Sorted array
 */
export function sortProjectsByPriority(projects: Project[]): Project[] {
  const statusPriority = { 'at-risk': 0, 'on-track': 1, completed: 2 };
  return [...projects].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
}
