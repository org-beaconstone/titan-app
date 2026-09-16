import { describe, it, expect } from 'vitest';
import {
  filterProjects,
  getDashboardMetrics,
  isProjectAtRisk,
  sortProjectsByPriority,
} from './project-policy';
import type { Project, Task } from './types';

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Dashboard Redesign',
    description: 'Update the analytics dashboard',
    status: 'on-track',
    progress: 65,
    dueDate: '2026-10-15',
    ownerId: 'u1',
    color: '#3b82f6',
  },
  {
    id: 'p2',
    name: 'API Migration',
    description: 'Migrate to GraphQL',
    status: 'at-risk',
    progress: 40,
    dueDate: '2026-09-28',
    ownerId: 'u2',
    color: '#ef4444',
  },
  {
    id: 'p3',
    name: 'Documentation',
    description: 'API and developer guides',
    status: 'completed',
    progress: 100,
    dueDate: '2026-08-31',
    ownerId: 'u1',
    color: '#10b981',
  },
];

const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Design layouts',
    projectId: 'p1',
    assigneeId: 'u1',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-10',
  },
  {
    id: 't2',
    title: 'Implement components',
    projectId: 'p1',
    assigneeId: 'u2',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-09-25',
  },
  {
    id: 't3',
    title: 'Schema definition',
    projectId: 'p2',
    assigneeId: 'u1',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-05',
  },
  {
    id: 't4',
    title: 'Optimize performance',
    projectId: 'p1',
    assigneeId: 'u3',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-05',
  },
];

describe('filterProjects', () => {
  it('returns all projects when query is empty', () => {
    const result = filterProjects(mockProjects, '');
    expect(result).toEqual(mockProjects);
  });

  it('filters by name match (case-insensitive)', () => {
    const result = filterProjects(mockProjects, 'dashboard');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('filters by description match', () => {
    const result = filterProjects(mockProjects, 'GraphQL');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p2');
  });

  it('filters by status when status is not all', () => {
    const result = filterProjects(mockProjects, '', 'on-track');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('on-track');
  });

  it('combines query and status filters', () => {
    const result = filterProjects(mockProjects, 'guide', 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p3');
  });

  it('returns empty array when no matches', () => {
    const result = filterProjects(mockProjects, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('ignores whitespace in query', () => {
    const result = filterProjects(mockProjects, '  dashboard  ');
    expect(result).toHaveLength(1);
  });
});

describe('getDashboardMetrics', () => {
  it('counts projects by status correctly', () => {
    const metrics = getDashboardMetrics(mockProjects, mockTasks, '2026-09-15');
    expect(metrics.totalProjects).toBe(3);
    expect(metrics.onTrackProjects).toBe(1);
    expect(metrics.atRiskProjects).toBe(1);
    expect(metrics.completedProjects).toBe(1);
  });

  it('counts tasks by status correctly', () => {
    const metrics = getDashboardMetrics(mockProjects, mockTasks, '2026-09-15');
    expect(metrics.totalTasks).toBe(4);
    expect(metrics.completedTasks).toBe(2);
  });

  it('identifies overdue tasks correctly', () => {
    const metrics = getDashboardMetrics(mockProjects, mockTasks, '2026-09-15');
    // t3 has dueDate 2026-09-05, which is before 2026-09-15, and status is 'done'
    // Done tasks are not counted as overdue
    // t1 has dueDate 2026-09-10 and status 'done' - not overdue
    // No tasks should be marked overdue
    expect(metrics.overdueTasks).toBe(0);
  });

  it('calculates average progress', () => {
    const metrics = getDashboardMetrics(mockProjects, mockTasks, '2026-09-15');
    const expected = Math.round((65 + 40 + 100) / 3);
    expect(metrics.averageProgress).toBe(expected);
  });

  it('handles empty projects and tasks', () => {
    const metrics = getDashboardMetrics([], [], '2026-09-15');
    expect(metrics.totalProjects).toBe(0);
    expect(metrics.totalTasks).toBe(0);
    expect(metrics.averageProgress).toBe(0);
  });

  it('uses current date by default', () => {
    // Should not throw
    const metrics = getDashboardMetrics(mockProjects, mockTasks);
    expect(metrics).toBeDefined();
  });
});

describe('isProjectAtRisk', () => {
  it('returns true for at-risk projects', () => {
    const atRiskProject = mockProjects.find((p) => p.status === 'at-risk')!;
    expect(isProjectAtRisk(atRiskProject)).toBe(true);
  });

  it('returns false for on-track projects', () => {
    const onTrackProject = mockProjects.find((p) => p.status === 'on-track')!;
    expect(isProjectAtRisk(onTrackProject)).toBe(false);
  });

  it('returns false for completed projects', () => {
    const completedProject = mockProjects.find((p) => p.status === 'completed')!;
    expect(isProjectAtRisk(completedProject)).toBe(false);
  });
});

describe('sortProjectsByPriority', () => {
  it('sorts at-risk first, then on-track, then completed', () => {
    const sorted = sortProjectsByPriority(mockProjects);
    expect(sorted[0].status).toBe('at-risk');
    expect(sorted[1].status).toBe('on-track');
    expect(sorted[2].status).toBe('completed');
  });

  it('does not mutate original array', () => {
    const original = [...mockProjects];
    sortProjectsByPriority(mockProjects);
    expect(mockProjects).toEqual(original);
  });

  it('handles single project', () => {
    const result = sortProjectsByPriority([mockProjects[0]]);
    expect(result).toHaveLength(1);
  });

  it('handles empty array', () => {
    const result = sortProjectsByPriority([]);
    expect(result).toHaveLength(0);
  });
});
