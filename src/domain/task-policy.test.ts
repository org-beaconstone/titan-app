import { describe, it, expect } from 'vitest';
import {
  isOverdue,
  filterTasksByProject,
  filterTasksByAssignee,
  filterTasksByStatus,
  findOverdueTasks,
  countTasksByStatus,
  sortTasksByPriority,
  calculateTaskProgress,
} from './task-policy';
import type { Task } from './types';

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
    title: 'Write tests',
    projectId: 'p1',
    assigneeId: 'u1',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-09-12',
  },
  {
    id: 't4',
    title: 'API integration',
    projectId: 'p2',
    assigneeId: 'u2',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-08',
  },
  {
    id: 't5',
    title: 'Documentation',
    projectId: 'p2',
    assigneeId: 'u3',
    status: 'done',
    priority: 'low',
    dueDate: '2026-09-20',
  },
];

describe('isOverdue', () => {
  it('returns false for tasks with future due dates', () => {
    const task = mockTasks[1]; // dueDate: 2026-09-25
    expect(isOverdue(task, '2026-09-15')).toBe(false);
  });

  it('returns false for tasks with today as due date', () => {
    const task = { ...mockTasks[0], dueDate: '2026-09-15' };
    expect(isOverdue(task, '2026-09-15')).toBe(false);
  });

  it('returns true for tasks with past due dates and not done', () => {
    const task = mockTasks[3]; // dueDate: 2026-09-08, status: 'todo'
    expect(isOverdue(task, '2026-09-15')).toBe(true);
  });

  it('returns false for done tasks regardless of due date', () => {
    const doneTask = { ...mockTasks[0], dueDate: '2026-09-01' };
    expect(isOverdue(doneTask, '2026-09-15')).toBe(false);
  });

  it('returns false for in-progress tasks with future due dates', () => {
    const task = mockTasks[1]; // status: 'in-progress', dueDate: 2026-09-25
    expect(isOverdue(task, '2026-09-15')).toBe(false);
  });

  it('returns true for in-progress tasks with past due dates', () => {
    const task = { ...mockTasks[1], dueDate: '2026-09-10' };
    expect(isOverdue(task, '2026-09-15')).toBe(true);
  });
});

describe('filterTasksByProject', () => {
  it('filters tasks by project ID', () => {
    const result = filterTasksByProject(mockTasks, 'p1');
    expect(result).toHaveLength(3);
    expect(result.every((t) => t.projectId === 'p1')).toBe(true);
  });

  it('returns empty array for non-existent project', () => {
    const result = filterTasksByProject(mockTasks, 'p999');
    expect(result).toHaveLength(0);
  });

  it('returns all tasks for a project with many tasks', () => {
    const result = filterTasksByProject(mockTasks, 'p2');
    expect(result).toHaveLength(2);
  });
});

describe('filterTasksByAssignee', () => {
  it('filters tasks by assignee ID', () => {
    const result = filterTasksByAssignee(mockTasks, 'u1');
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.assigneeId === 'u1')).toBe(true);
  });

  it('returns empty array for non-existent assignee', () => {
    const result = filterTasksByAssignee(mockTasks, 'u999');
    expect(result).toHaveLength(0);
  });
});

describe('filterTasksByStatus', () => {
  it('filters tasks by status', () => {
    const result = filterTasksByStatus(mockTasks, 'done');
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.status === 'done')).toBe(true);
  });

  it('handles all status types', () => {
    expect(filterTasksByStatus(mockTasks, 'todo')).toHaveLength(2);
    expect(filterTasksByStatus(mockTasks, 'in-progress')).toHaveLength(1);
    expect(filterTasksByStatus(mockTasks, 'done')).toHaveLength(2);
  });
});

describe('findOverdueTasks', () => {
  it('identifies overdue tasks', () => {
    const result = findOverdueTasks(mockTasks, '2026-09-15');
    // t3 (2026-09-12, todo) and t4 (2026-09-08, todo) are both overdue
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toContain('t3');
    expect(result.map((t) => t.id)).toContain('t4');
  });

  it('excludes done tasks from overdue list', () => {
    const taskList = [
      ...mockTasks,
      {
        id: 't6',
        title: 'Old completed task',
        projectId: 'p1',
        assigneeId: 'u1',
        status: 'done' as const,
        priority: 'high' as const,
        dueDate: '2026-08-01',
      },
    ];
    const result = findOverdueTasks(taskList, '2026-09-15');
    // t3 (2026-09-12, todo) and t4 (2026-09-08, todo) are overdue, but t6 is done so excluded
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).not.toContain('t6');
  });

  it('returns empty array when no overdue tasks', () => {
    const result = findOverdueTasks(mockTasks, '2026-09-05');
    expect(result).toHaveLength(0);
  });
});

describe('countTasksByStatus', () => {
  it('counts tasks by each status', () => {
    const counts = countTasksByStatus(mockTasks);
    expect(counts.todo).toBe(2);
    expect(counts['in-progress']).toBe(1);
    expect(counts.done).toBe(2);
  });

  it('returns zero counts for empty array', () => {
    const counts = countTasksByStatus([]);
    expect(counts.todo).toBe(0);
    expect(counts['in-progress']).toBe(0);
    expect(counts.done).toBe(0);
  });
});

describe('sortTasksByPriority', () => {
  it('sorts by priority high > medium > low', () => {
    const sorted = sortTasksByPriority(mockTasks);
    expect(sorted[0].priority).toBe('high');
    expect(sorted[2].priority).toBe('high');
    expect(sorted[3].priority).toBe('medium');
    expect(sorted[4].priority).toBe('low');
  });

  it('sorts by due date within same priority', () => {
    // Within high priority, t4 (2026-09-08) should come before t1 (2026-09-10) and t2 (2026-09-25)
    const sorted = sortTasksByPriority(mockTasks);
    const highPriority = sorted.filter((t) => t.priority === 'high');
    // Verify that dates are in ascending order (comparing as strings works for YYYY-MM-DD format)
    for (let i = 1; i < highPriority.length; i++) {
      expect(highPriority[i - 1].dueDate <= highPriority[i].dueDate).toBe(true);
    }
  });

  it('does not mutate original array', () => {
    const original = [...mockTasks];
    sortTasksByPriority(mockTasks);
    expect(mockTasks).toEqual(original);
  });
});

describe('calculateTaskProgress', () => {
  it('calculates progress as percentage of done tasks', () => {
    const tasks = mockTasks;
    const progress = calculateTaskProgress(tasks);
    // 2 done out of 5 = 40%
    expect(progress).toBe(40);
  });

  it('returns 0 for empty task array', () => {
    const progress = calculateTaskProgress([]);
    expect(progress).toBe(0);
  });

  it('returns 100 for all done tasks', () => {
    const allDone = mockTasks.map((t) => ({ ...t, status: 'done' as const }));
    const progress = calculateTaskProgress(allDone);
    expect(progress).toBe(100);
  });

  it('returns 0 for no done tasks', () => {
    const noneDone = mockTasks.map((t) => ({ ...t, status: 'todo' as const }));
    const progress = calculateTaskProgress(noneDone);
    expect(progress).toBe(0);
  });

  it('rounds progress correctly', () => {
    const tasks = [
      {
        id: 't1',
        title: 'Task 1',
        projectId: 'p1',
        assigneeId: 'u1',
        status: 'done' as const,
        priority: 'high' as const,
        dueDate: '2026-09-15',
      },
      {
        id: 't2',
        title: 'Task 2',
        projectId: 'p1',
        assigneeId: 'u1',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: '2026-09-15',
      },
      {
        id: 't3',
        title: 'Task 3',
        projectId: 'p1',
        assigneeId: 'u1',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: '2026-09-15',
      },
    ];
    const progress = calculateTaskProgress(tasks);
    // 1 done out of 3 = 33.333... ≈ 33
    expect(progress).toBe(33);
  });
});
