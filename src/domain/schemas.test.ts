import { describe, it, expect } from 'vitest';
import { projectInputSchema, taskInputSchema, preferencesSchema } from './schemas';

describe('projectInputSchema', () => {
  it('validates a valid project input', () => {
    const input = {
      name: 'New Project',
      description: 'A test project',
      status: 'on-track' as const,
      dueDate: '2026-10-15',
      ownerId: 'user-1',
      color: '#3b82f6',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('uses default values for optional fields', () => {
    const input = {
      name: 'New Project',
      dueDate: '2026-10-15',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
      expect(result.data.status).toBe('on-track');
      expect(result.data.color).toBe('#3b82f6');
    }
  });

  it('rejects empty name', () => {
    const input = {
      name: '',
      dueDate: '2026-10-15',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length', () => {
    const input = {
      name: 'x'.repeat(256),
      dueDate: '2026-10-15',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding max length', () => {
    const input = {
      name: 'Project',
      description: 'x'.repeat(1001),
      dueDate: '2026-10-15',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const input = {
      name: 'Project',
      status: 'invalid-status' as unknown as 'on-track',
      dueDate: '2026-10-15',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const input = {
      name: 'Project',
      dueDate: '2026/10/15',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty ownerId', () => {
    const input = {
      name: 'Project',
      dueDate: '2026-10-15',
      ownerId: '',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('validates all valid statuses', () => {
    const statuses = ['on-track', 'at-risk', 'completed'] as const;
    for (const status of statuses) {
      const input = {
        name: 'Project',
        status,
        dueDate: '2026-10-15',
        ownerId: 'user-1',
      };
      const result = projectInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid date (Feb 30)', () => {
    const input = {
      name: 'Project',
      dueDate: '2026-02-30',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid leap year date (Feb 30 on leap year would still be invalid)', () => {
    const input = {
      name: 'Project',
      dueDate: '2024-02-30',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts valid leap year date (Feb 29)', () => {
    const input = {
      name: 'Project',
      dueDate: '2024-02-29',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects invalid hex color', () => {
    const input = {
      name: 'Project',
      dueDate: '2026-10-15',
      ownerId: 'user-1',
      color: '#fff',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid hex color with invalid characters', () => {
    const input = {
      name: 'Project',
      dueDate: '2026-10-15',
      ownerId: 'user-1',
      color: '#gggggg',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts valid hex color', () => {
    const input = {
      name: 'Project',
      dueDate: '2026-10-15',
      ownerId: 'user-1',
      color: '#ff5733',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('trims whitespace from project name', () => {
    const input = {
      name: '  Project Name  ',
      dueDate: '2026-10-15',
      ownerId: 'user-1',
    };
    const result = projectInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Project Name');
    }
  });
});

describe('taskInputSchema', () => {
  it('validates a valid task input', () => {
    const input = {
      title: 'Complete task',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('uses default values for optional fields', () => {
    const input = {
      title: 'Task',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('todo');
      expect(result.data.priority).toBe('medium');
    }
  });

  it('rejects empty title', () => {
    const input = {
      title: '',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding max length', () => {
    const input = {
      title: 'x'.repeat(256),
      projectId: 'proj-1',
      assigneeId: 'user-1',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty projectId', () => {
    const input = {
      title: 'Task',
      projectId: '',
      assigneeId: 'user-1',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty assigneeId', () => {
    const input = {
      title: 'Task',
      projectId: 'proj-1',
      assigneeId: '',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const input = {
      title: 'Task',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      status: 'invalid' as unknown as 'todo',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const input = {
      title: 'Task',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      priority: 'critical' as unknown as 'high',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const input = {
      title: 'Task',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      dueDate: '09/25/2026',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('validates all valid statuses', () => {
    const statuses = ['todo', 'in-progress', 'done'] as const;
    for (const status of statuses) {
      const input = {
        title: 'Task',
        projectId: 'proj-1',
        assigneeId: 'user-1',
        status,
        dueDate: '2026-09-25',
      };
      const result = taskInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it('validates all valid priorities', () => {
    const priorities = ['low', 'medium', 'high'] as const;
    for (const priority of priorities) {
      const input = {
        title: 'Task',
        projectId: 'proj-1',
        assigneeId: 'user-1',
        priority,
        dueDate: '2026-09-25',
      };
      const result = taskInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid date (Feb 30)', () => {
    const input = {
      title: 'Task',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      dueDate: '2026-02-30',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts valid leap year date (Feb 29)', () => {
    const input = {
      title: 'Task',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      dueDate: '2024-02-29',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('trims whitespace from task title', () => {
    const input = {
      title: '  Complete task  ',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      dueDate: '2026-09-25',
    };
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Complete task');
    }
  });
});

describe('preferencesSchema', () => {
  it('validates a valid preferences input', () => {
    const input = {
      displayName: 'John Doe',
      email: 'john@example.com',
      timezone: 'America/New_York',
      emailDigest: true,
      mentionAlerts: false,
      theme: 'dark' as const,
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('uses default values for optional fields', () => {
    const input = {
      displayName: 'John Doe',
      email: 'john@example.com',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timezone).toBe('UTC');
      expect(result.data.emailDigest).toBe(true);
      expect(result.data.mentionAlerts).toBe(true);
      expect(result.data.theme).toBe('system');
    }
  });

  it('rejects empty displayName', () => {
    const input = {
      displayName: '',
      email: 'john@example.com',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects displayName exceeding max length', () => {
    const input = {
      displayName: 'x'.repeat(256),
      email: 'john@example.com',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const input = {
      displayName: 'John Doe',
      email: 'not-an-email',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty timezone', () => {
    const input = {
      displayName: 'John Doe',
      email: 'john@example.com',
      timezone: '',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid theme', () => {
    const input = {
      displayName: 'John Doe',
      email: 'john@example.com',
      theme: 'neon' as unknown as 'light',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('validates all valid themes', () => {
    const themes = ['light', 'dark', 'system'] as const;
    for (const theme of themes) {
      const input = {
        displayName: 'John Doe',
        email: 'john@example.com',
        theme,
      };
      const result = preferencesSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it('accepts various valid emails', () => {
    const emails = ['simple@example.com', 'user.name@example.co.uk', 'user+tag@example.com'];
    for (const email of emails) {
      const input = {
        displayName: 'User',
        email,
      };
      const result = preferencesSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid timezone', () => {
    const input = {
      displayName: 'John Doe',
      email: 'john@example.com',
      timezone: 'Invalid/Timezone',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts valid timezones', () => {
    const timezones = [
      'UTC',
      'America/New_York',
      'Europe/London',
      'Asia/Tokyo',
      'Australia/Sydney',
    ];
    for (const timezone of timezones) {
      const input = {
        displayName: 'User',
        email: 'user@example.com',
        timezone,
      };
      const result = preferencesSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it('trims whitespace from displayName', () => {
    const input = {
      displayName: '  John Doe  ',
      email: 'john@example.com',
    };
    const result = preferencesSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe('John Doe');
    }
  });
});
