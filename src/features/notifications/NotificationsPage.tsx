import { Bell, AtSign, Layers3, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../app/AppProvider';
import { EmptyState, PageHeading } from '../../components/ui';
export default function NotificationsPage() {
  const { state, unread, readNotification, readAll } = useApp();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const items = state.notifications.filter((n) => !onlyUnread || !n.read);
  return (
    <>
      <PageHeading
        eyebrow="STAY IN THE LOOP"
        title="Your inbox"
        description={`${unread} unread ${unread === 1 ? 'update' : 'updates'}. Just the things that need your attention.`}
        action={
          <button className="button secondary" disabled={!unread} onClick={readAll}>
            <CheckCheck size={17} />
            Mark all as read
          </button>
        }
      />
      <div className="filter-bar">
        <div className="segmented">
          <button aria-pressed={!onlyUnread} onClick={() => setOnlyUnread(false)}>
            All updates
          </button>
          <button aria-pressed={onlyUnread} onClick={() => setOnlyUnread(true)}>
            Unread ({unread})
          </button>
        </div>
        <span className="muted">Notifications are fictional and stored locally</span>
      </div>
      <section className="panel notification-list">
        {items.length ? (
          items.map((n) => {
            const Icon = n.kind === 'mention' ? AtSign : n.kind === 'project' ? Layers3 : Bell;
            return (
              <article key={n.id} className={`notification-row ${n.read ? 'read' : ''}`}>
                <span className={`notification-icon ${n.kind}`}>
                  <Icon size={20} />
                </span>
                <div>
                  <h2>{n.title}</h2>
                  <p>{n.body}</p>
                  <time dateTime={n.createdAt}>
                    {new Intl.DateTimeFormat('en', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: state.preferences.timezone,
                    }).format(new Date(n.createdAt))}
                  </time>
                </div>
                {!n.read ? (
                  <button
                    className="button small-button secondary"
                    onClick={() => readNotification(n.id)}
                  >
                    Mark as read
                  </button>
                ) : (
                  <span className="read-label">Read</span>
                )}
              </article>
            );
          })
        ) : (
          <EmptyState title="You're all caught up">
            A clear inbox. A little more room to focus.
          </EmptyState>
        )}
      </section>
      <p role="status" className="sr-only">
        {unread} unread notifications
      </p>
    </>
  );
}
