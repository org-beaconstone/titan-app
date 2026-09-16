import type { ReactNode } from 'react';
import type { ProjectStatus } from '../domain/types';
export function Badge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`badge ${status}`}>
      <i />
      {{ 'on-track': 'On track', 'at-risk': 'At risk', completed: 'Completed' }[status]}
    </span>
  );
}
export function Avatar({
  name,
  color = '#7263cf',
  small = false,
}: {
  name: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <span className={`avatar ${small ? 'small' : ''}`} style={{ background: color }} title={name}>
      {name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')}
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <span>✧</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(value + 'T00:00:00Z'),
  );
}
