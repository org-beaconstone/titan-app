import { describe, it, expect } from 'vitest';
import {
  unreadCount,
  markAllRead,
  markAsRead,
  filterByKind,
  filterByReadStatus,
  sortByDate,
  groupByKind,
  removeNotification,
} from './notification-policy';
import type { Notification } from './types';

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Task assigned',
    body: 'You have been assigned a task',
    read: false,
    createdAt: '2026-09-15T14:30:00Z',
    kind: 'mention',
  },
  {
    id: 'n2',
    title: 'Project update',
    body: 'Dashboard project has been updated',
    read: false,
    createdAt: '2026-09-15T12:00:00Z',
    kind: 'project',
  },
  {
    id: 'n3',
    title: 'Maintenance window',
    body: 'System maintenance scheduled',
    read: true,
    createdAt: '2026-09-14T08:15:00Z',
    kind: 'system',
  },
  {
    id: 'n4',
    title: 'Code review requested',
    body: 'Please review my pull request',
    read: true,
    createdAt: '2026-09-14T15:45:00Z',
    kind: 'mention',
  },
  {
    id: 'n5',
    title: 'Project milestone',
    body: 'Mobile app project reached 80% completion',
    read: false,
    createdAt: '2026-09-13T10:20:00Z',
    kind: 'project',
  },
];

describe('unreadCount', () => {
  it('counts unread notifications', () => {
    const count = unreadCount(mockNotifications);
    expect(count).toBe(3);
  });

  it('returns 0 for all read notifications', () => {
    const allRead = mockNotifications.map((n) => ({ ...n, read: true }));
    const count = unreadCount(allRead);
    expect(count).toBe(0);
  });

  it('returns total count for all unread notifications', () => {
    const allUnread = mockNotifications.map((n) => ({ ...n, read: false }));
    const count = unreadCount(allUnread);
    expect(count).toBe(5);
  });

  it('returns 0 for empty array', () => {
    const count = unreadCount([]);
    expect(count).toBe(0);
  });
});

describe('markAllRead', () => {
  it('marks all notifications as read', () => {
    const result = markAllRead(mockNotifications);
    expect(result.every((n) => n.read)).toBe(true);
  });

  it('does not mutate original array', () => {
    const original = [...mockNotifications];
    markAllRead(mockNotifications);
    expect(mockNotifications).toEqual(original);
  });

  it('preserves notification content', () => {
    const result = markAllRead(mockNotifications);
    expect(result[0].title).toBe(mockNotifications[0].title);
    expect(result[0].id).toBe(mockNotifications[0].id);
  });

  it('returns empty array for empty input', () => {
    const result = markAllRead([]);
    expect(result).toHaveLength(0);
  });
});

describe('markAsRead', () => {
  it('marks specific notification as read', () => {
    const result = markAsRead(mockNotifications, 'n1');
    const updated = result.find((n) => n.id === 'n1');
    expect(updated?.read).toBe(true);
  });

  it('leaves other notifications unchanged', () => {
    const result = markAsRead(mockNotifications, 'n1');
    const unaffected = result.find((n) => n.id === 'n2');
    expect(unaffected?.read).toBe(mockNotifications.find((n) => n.id === 'n2')?.read);
  });

  it('returns unchanged array if notification not found', () => {
    const result = markAsRead(mockNotifications, 'n999');
    expect(result).toEqual(mockNotifications);
  });

  it('does not mutate original array', () => {
    const original = [...mockNotifications];
    markAsRead(mockNotifications, 'n1');
    expect(mockNotifications).toEqual(original);
  });
});

describe('filterByKind', () => {
  it('filters notifications by kind', () => {
    const result = filterByKind(mockNotifications, 'mention');
    expect(result).toHaveLength(2);
    expect(result.every((n) => n.kind === 'mention')).toBe(true);
  });

  it('filters project notifications', () => {
    const result = filterByKind(mockNotifications, 'project');
    expect(result).toHaveLength(2);
  });

  it('filters system notifications', () => {
    const result = filterByKind(mockNotifications, 'system');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('n3');
  });

  it('returns empty array for no matches', () => {
    const result = filterByKind([], 'mention');
    expect(result).toHaveLength(0);
  });
});

describe('filterByReadStatus', () => {
  it('filters unread notifications', () => {
    const result = filterByReadStatus(mockNotifications, false);
    expect(result).toHaveLength(3);
    expect(result.every((n) => !n.read)).toBe(true);
  });

  it('filters read notifications', () => {
    const result = filterByReadStatus(mockNotifications, true);
    expect(result).toHaveLength(2);
    expect(result.every((n) => n.read)).toBe(true);
  });

  it('returns empty array when no notifications match', () => {
    const allRead = mockNotifications.map((n) => ({ ...n, read: true }));
    const result = filterByReadStatus(allRead, false);
    expect(result).toHaveLength(0);
  });
});

describe('sortByDate', () => {
  it('sorts notifications by creation date (newest first)', () => {
    const result = sortByDate(mockNotifications);
    expect(result[0].createdAt).toBe('2026-09-15T14:30:00Z');
    expect(result[result.length - 1].createdAt).toBe('2026-09-13T10:20:00Z');
  });

  it('does not mutate original array', () => {
    const original = [...mockNotifications];
    sortByDate(mockNotifications);
    expect(mockNotifications).toEqual(original);
  });

  it('handles single notification', () => {
    const result = sortByDate([mockNotifications[0]]);
    expect(result).toHaveLength(1);
  });

  it('handles empty array', () => {
    const result = sortByDate([]);
    expect(result).toHaveLength(0);
  });
});

describe('groupByKind', () => {
  it('groups notifications by kind', () => {
    const result = groupByKind(mockNotifications);
    expect(result.mention).toHaveLength(2);
    expect(result.project).toHaveLength(2);
    expect(result.system).toHaveLength(1);
  });

  it('includes all notification kinds in result', () => {
    const result = groupByKind(mockNotifications);
    expect('mention' in result).toBe(true);
    expect('project' in result).toBe(true);
    expect('system' in result).toBe(true);
  });

  it('returns empty groups for empty input', () => {
    const result = groupByKind([]);
    expect(result.mention).toHaveLength(0);
    expect(result.project).toHaveLength(0);
    expect(result.system).toHaveLength(0);
  });

  it('handles single kind', () => {
    const onlyMentions = mockNotifications.filter((n) => n.kind === 'mention');
    const result = groupByKind(onlyMentions);
    expect(result.mention).toHaveLength(2);
    expect(result.project).toHaveLength(0);
    expect(result.system).toHaveLength(0);
  });
});

describe('removeNotification', () => {
  it('removes notification by ID', () => {
    const result = removeNotification(mockNotifications, 'n1');
    expect(result).toHaveLength(4);
    expect(result.find((n) => n.id === 'n1')).toBeUndefined();
  });

  it('leaves other notifications unchanged', () => {
    const result = removeNotification(mockNotifications, 'n1');
    expect(result.find((n) => n.id === 'n2')).toBeDefined();
  });

  it('returns unchanged array if notification not found', () => {
    const result = removeNotification(mockNotifications, 'n999');
    expect(result).toEqual(mockNotifications);
  });

  it('does not mutate original array', () => {
    const original = [...mockNotifications];
    removeNotification(mockNotifications, 'n1');
    expect(mockNotifications).toEqual(original);
  });

  it('handles empty array', () => {
    const result = removeNotification([], 'n1');
    expect(result).toHaveLength(0);
  });
});
