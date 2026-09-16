/**
 * Business logic for notification operations.
 * Handles notification filtering, counting, and status updates.
 */

import type { Notification, NotificationKind } from './types';

/**
 * Counts unread notifications.
 * Pure function with no side effects.
 *
 * @param notifications - Array of notifications
 * @returns Count of unread notifications
 *
 * @example
 * const count = unreadCount(notifications);
 */
export function unreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}

/**
 * Marks all notifications as read.
 * Returns a new array with all notifications marked read.
 * Pure function—does not mutate the input.
 *
 * @param notifications - Array of notifications
 * @returns New array with all notifications marked as read
 *
 * @example
 * const updated = markAllRead(notifications);
 */
export function markAllRead(notifications: Notification[]): Notification[] {
  return notifications.map((n) => ({ ...n, read: true }));
}

/**
 * Marks a single notification as read by ID.
 * Returns a new array with the specified notification updated.
 * Pure function—does not mutate the input.
 *
 * @param notifications - Array of notifications
 * @param notificationId - ID of notification to mark as read
 * @returns New array with the notification marked as read, or unchanged if not found
 *
 * @example
 * const updated = markAsRead(notifications, 'notif-1');
 */
export function markAsRead(notifications: Notification[], notificationId: string): Notification[] {
  return notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
}

/**
 * Filters notifications by kind.
 *
 * @param notifications - Array of notifications
 * @param kind - Notification kind to filter by
 * @returns Filtered array of notifications
 *
 * @example
 * const mentions = filterByKind(notifications, 'mention');
 */
export function filterByKind(
  notifications: Notification[],
  kind: NotificationKind,
): Notification[] {
  return notifications.filter((n) => n.kind === kind);
}

/**
 * Filters notifications by read status.
 *
 * @param notifications - Array of notifications
 * @param read - true for read, false for unread
 * @returns Filtered array of notifications
 *
 * @example
 * const unread = filterByReadStatus(notifications, false);
 */
export function filterByReadStatus(notifications: Notification[], read: boolean): Notification[] {
  return notifications.filter((n) => n.read === read);
}

/**
 * Sorts notifications by creation date (newest first).
 *
 * @param notifications - Array of notifications
 * @returns Sorted array (does not mutate input)
 *
 * @example
 * const sorted = sortByDate(notifications);
 */
export function sortByDate(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Groups notifications by kind.
 *
 * @param notifications - Array of notifications
 * @returns Object with kinds as keys and notification arrays as values
 *
 * @example
 * const grouped = groupByKind(notifications);
 * // { mention: [...], project: [...], system: [...] }
 */
export function groupByKind(
  notifications: Notification[],
): Record<NotificationKind, Notification[]> {
  return {
    mention: filterByKind(notifications, 'mention'),
    project: filterByKind(notifications, 'project'),
    system: filterByKind(notifications, 'system'),
  };
}

/**
 * Removes a notification by ID.
 * Returns a new array without the specified notification.
 * Pure function—does not mutate the input.
 *
 * @param notifications - Array of notifications
 * @param notificationId - ID of notification to remove
 * @returns New array without the notification
 *
 * @example
 * const updated = removeNotification(notifications, 'notif-1');
 */
export function removeNotification(
  notifications: Notification[],
  notificationId: string,
): Notification[] {
  return notifications.filter((n) => n.id !== notificationId);
}
