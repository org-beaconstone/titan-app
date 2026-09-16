/**
 * Demo data fixtures for the Titan application.
 * Used for development, testing, and onboarding.
 * All data is fictional and for demonstration purposes only.
 */

import type { Project, Task, Member, Notification, Preferences } from '../domain/types';

/**
 * Reference date for all fixture data.
 * Used to calculate relative dates and ensure consistency.
 */
export const DEMO_TODAY = '2026-09-15';

/**
 * Demo member representing the current user.
 */
export const members: Member[] = [
  {
    id: 'member-1',
    name: 'Avery Morgan',
    role: 'Product Lead',
    initials: 'AM',
    color: '#ec4899',
  },
  {
    id: 'member-2',
    name: 'Jordan Clarke',
    role: 'Engineer',
    initials: 'JC',
    color: '#06b6d4',
  },
  {
    id: 'member-3',
    name: 'Casey Rodriguez',
    role: 'Designer',
    initials: 'CR',
    color: '#f59e0b',
  },
  {
    id: 'member-4',
    name: 'Morgan Zhang',
    role: 'QA Analyst',
    initials: 'MZ',
    color: '#10b981',
  },
  {
    id: 'member-5',
    name: 'Riley Patterson',
    role: 'Developer',
    initials: 'RP',
    color: '#8b5cf6',
  },
];

/**
 * Demo projects spanning various statuses and progress levels.
 * Includes projects owned by different team members.
 */
export const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Dashboard Redesign',
    description: 'Modernize the analytics dashboard with improved visualizations and performance.',
    status: 'on-track',
    progress: 65,
    dueDate: '2026-10-15',
    ownerId: 'member-1',
    color: '#3b82f6',
  },
  {
    id: 'proj-2',
    name: 'API Gateway Migration',
    description: 'Move from legacy REST endpoints to GraphQL for improved flexibility.',
    status: 'at-risk',
    progress: 40,
    dueDate: '2026-09-28',
    ownerId: 'member-2',
    color: '#ef4444',
  },
  {
    id: 'proj-3',
    name: 'Mobile App Launch',
    description: 'Ship the native mobile application for iOS and Android.',
    status: 'on-track',
    progress: 85,
    dueDate: '2026-09-30',
    ownerId: 'member-1',
    color: '#8b5cf6',
  },
  {
    id: 'proj-4',
    name: 'Security Audit & Hardening',
    description: 'Complete third-party security audit and implement all critical recommendations.',
    status: 'on-track',
    progress: 55,
    dueDate: '2026-11-30',
    ownerId: 'member-3',
    color: '#06b6d4',
  },
  {
    id: 'proj-5',
    name: 'Documentation Portal',
    description: 'Create comprehensive API documentation and developer guides.',
    status: 'completed',
    progress: 100,
    dueDate: '2026-08-31',
    ownerId: 'member-4',
    color: '#10b981',
  },
  {
    id: 'proj-6',
    name: 'Payment Integration',
    description: 'Integrate Stripe and add recurring billing capabilities.',
    status: 'on-track',
    progress: 72,
    dueDate: '2026-10-01',
    ownerId: 'member-2',
    color: '#f59e0b',
  },
];

/**
 * Demo tasks distributed across projects and team members.
 * Mix of statuses and priorities to reflect realistic workload.
 */
export const tasks: Task[] = [
  // Dashboard Redesign tasks
  {
    id: 'task-1',
    title: 'Design new dashboard layout',
    projectId: 'proj-1',
    assigneeId: 'member-3',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-20',
  },
  {
    id: 'task-2',
    title: 'Implement chart components',
    projectId: 'proj-1',
    assigneeId: 'member-2',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-09-25',
  },
  {
    id: 'task-3',
    title: 'Performance optimization',
    projectId: 'proj-1',
    assigneeId: 'member-5',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-05',
  },
  // API Gateway Migration tasks
  {
    id: 'task-4',
    title: 'Schema definition and design',
    projectId: 'proj-2',
    assigneeId: 'member-2',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-10',
  },
  {
    id: 'task-5',
    title: 'Resolver implementation',
    projectId: 'proj-2',
    assigneeId: 'member-5',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-09-22',
  },
  {
    id: 'task-6',
    title: 'Migration strategy and rollout plan',
    projectId: 'proj-2',
    assigneeId: 'member-1',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-18',
  },
  // Mobile App Launch tasks
  {
    id: 'task-7',
    title: 'iOS app store submission',
    projectId: 'proj-3',
    assigneeId: 'member-2',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-09-20',
  },
  {
    id: 'task-8',
    title: 'Android beta testing',
    projectId: 'proj-3',
    assigneeId: 'member-4',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-15',
  },
  {
    id: 'task-9',
    title: 'User onboarding flow',
    projectId: 'proj-3',
    assigneeId: 'member-3',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-09-25',
  },
  // Security Audit tasks
  {
    id: 'task-10',
    title: 'Conduct penetration testing',
    projectId: 'proj-4',
    assigneeId: 'member-1',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-10-15',
  },
  {
    id: 'task-11',
    title: 'Database encryption upgrade',
    projectId: 'proj-4',
    assigneeId: 'member-5',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-20',
  },
  {
    id: 'task-12',
    title: 'Update security documentation',
    projectId: 'proj-4',
    assigneeId: 'member-3',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-11-01',
  },
];

/**
 * Demo notifications for the current user.
 * Mix of read and unread, various kinds.
 */
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Task assigned: Implement chart components',
    body: 'You have been assigned a high priority task on the Dashboard Redesign project.',
    read: false,
    createdAt: '2026-09-15T14:30:00Z',
    kind: 'mention',
  },
  {
    id: 'notif-2',
    title: 'Project update: Mobile App Launch',
    body: 'The project status has been updated. Review the latest progress in the dashboard.',
    read: false,
    createdAt: '2026-09-15T12:00:00Z',
    kind: 'project',
  },
  {
    id: 'notif-3',
    title: 'Maintenance window scheduled',
    body: 'System maintenance is scheduled for tonight at 2 AM UTC. Expected downtime: 30 minutes.',
    read: true,
    createdAt: '2026-09-14T08:15:00Z',
    kind: 'system',
  },
  {
    id: 'notif-4',
    title: 'API Gateway Migration progressing',
    body: 'Jordan Clarke completed the schema definition task. Next phase begins tomorrow.',
    read: true,
    createdAt: '2026-09-14T15:45:00Z',
    kind: 'project',
  },
  {
    id: 'notif-5',
    title: 'Reminder: Code review pending',
    body: 'You have 2 pull requests awaiting your review on the mobile app branch.',
    read: true,
    createdAt: '2026-09-13T10:20:00Z',
    kind: 'mention',
  },
];

/**
 * Default user preferences for the current user (Avery Morgan, member-1).
 * Can be persisted to local storage and updated by user.
 */
export const defaultPreferences: Preferences = {
  displayName: 'Avery Morgan',
  email: 'avery.morgan@titan.example',
  timezone: 'America/New_York',
  emailDigest: true,
  mentionAlerts: true,
  theme: 'system',
};
