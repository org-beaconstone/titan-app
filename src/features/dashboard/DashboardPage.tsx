import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Layers3,
  ListChecks,
  Flag,
  Users,
  CalendarDays,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../app/AppProvider';
import { members, DEMO_TODAY } from '../../data/fixtures';
import { isOverdue } from '../../domain/task-policy';
import { Avatar, Badge, formatDate, EmptyState, PageHeading } from '../../components/ui';
import type { Task } from '../../domain/types';
export default function DashboardPage() {
  const { state, toggleTask } = useApp();
  const [scope, setScope] = useState('mine');
  const done = state.tasks.filter((t) => t.status === 'done').length;
  const active = state.projects.filter((p) => p.status !== 'completed');
  const visible = state.tasks.filter((t) => scope === 'all' || t.assigneeId === 'member-1');
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORK, IN FOCUS"
        title={`Good morning, ${state.preferences.displayName.split(' ')[0]}.`}
        description="A little clarity. A lot of possibility. Here's where things stand."
        action={
          <Link to="/projects?create=1" className="button primary">
            + New project
          </Link>
        }
      />
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">
            <i /> THE BIG PICTURE
          </span>
          <h2>
            Great work starts
            <br />
            with a clear view.
          </h2>
          <p>{active.length} projects moving forward. One place to keep your team in sync.</p>
          <Link to="/projects" className="hero-link">
            See your projects <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orb">
            <span>T</span>
          </div>
          <div className="float-card card-one">
            <span className="tiny-check">✓</span>Ideas into impact
          </div>
          <div className="float-card card-two">
            <span className="tiny-dot" /> Built together
          </div>
          <span className="hero-star">✳</span>
        </div>
      </section>
      <div className="stats-grid">
        {[
          {
            label: 'Active projects',
            value: active.length,
            detail: 'Across your workspace',
            icon: Layers3,
            tone: 'orange',
          },
          {
            label: 'Tasks completed',
            value: done,
            detail: `of ${state.tasks.length} total tasks`,
            icon: ListChecks,
            tone: 'green',
          },
          {
            label: 'Needs attention',
            value: state.projects.filter((p) => p.status === 'at-risk').length,
            detail: 'Projects flagged at risk',
            icon: Flag,
            tone: 'violet',
          },
          {
            label: 'Team members',
            value: members.length,
            detail: 'Better, together',
            icon: Users,
            tone: 'blue',
          },
        ].map(({ label, value, detail, icon: Icon, tone }) => (
          <section className="stat-card" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={19} className={`ink-${tone}`} />
            </div>
            <strong>{value.toString().padStart(2, '0')}</strong>
            <small>{detail}</small>
          </section>
        ))}
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>
                Your projects <span className="count">{state.projects.length}</span>
              </h2>
              <p>The latest on what you're building.</p>
            </div>
            <Link to="/projects" className="text-link">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="project-list">
            {state.projects.slice(0, 3).map((p) => (
              <Link
                to={`/projects?q=${encodeURIComponent(p.name)}`}
                className="project-row"
                key={p.id}
              >
                <span
                  className="project-glyph"
                  style={{ background: p.color + '18', color: p.color }}
                >
                  <Layers3 size={20} />
                </span>
                <div className="project-row-info">
                  <strong>{p.name}</strong>
                  <small>
                    <CalendarDays size={12} /> {formatDate(p.dueDate)}
                  </small>
                </div>
                <div className="project-row-progress">
                  <Badge status={p.status} />
                  <div className="progress-track">
                    <span style={{ width: `${p.progress}%`, background: p.color }} />
                  </div>
                </div>
                <span className="percentage">{p.progress}%</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="panel team-panel">
          <div className="panel-heading">
            <div>
              <h2>The people behind it</h2>
              <p>Your Northstar crew.</p>
            </div>
            <Users size={20} />
          </div>
          {members.slice(0, 4).map((m) => (
            <div className="team-row" key={m.id}>
              <Avatar name={m.name} color={m.color} />
              <div>
                <strong>{m.name}</strong>
                <small>{m.role}</small>
              </div>
              <span className="online-dot" title="Illustrative availability" />
            </div>
          ))}
          <Link to="/settings" className="team-footer">
            Manage your profile <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Make room for progress</h2>
            <p>Small steps. Meaningful momentum.</p>
          </div>
          <div className="segmented" aria-label="Task scope">
            {['mine', 'all'].map((s) => (
              <button key={s} aria-pressed={scope === s} onClick={() => setScope(s)}>
                {s === 'mine' ? 'Assigned to me' : 'All tasks'}
              </button>
            ))}
          </div>
        </div>
        <div className="task-list">
          {visible.length ? (
            visible.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                toggle={() => toggleTask(t.id)}
                project={state.projects.find((p) => p.id === t.projectId)?.name || 'Project'}
              />
            ))
          ) : (
            <EmptyState title="A little breathing room">No tasks in this view.</EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
function TaskRow({ task, toggle, project }: { task: Task; toggle: () => void; project: string }) {
  const member = members.find((m) => m.id === task.assigneeId);
  return (
    <div className={`task-row ${task.status === 'done' ? 'done' : ''}`}>
      <button
        className="task-checkbox"
        aria-label={`Mark ${task.title} ${task.status === 'done' ? 'incomplete' : 'complete'}`}
        aria-pressed={task.status === 'done'}
        onClick={toggle}
      >
        {task.status === 'done' && <Check size={14} />}
      </button>
      <div className="task-title">
        <strong>{task.title}</strong>
        <small>{project}</small>
      </div>
      <span className={`priority ${task.priority}`}>{task.priority}</span>
      <span className={isOverdue(task, DEMO_TODAY) ? 'due overdue' : 'due'}>
        {isOverdue(task, DEMO_TODAY) ? 'Overdue · ' : ''}
        {formatDate(task.dueDate)}
      </span>
      <Avatar small name={member?.name || 'Unknown'} color={member?.color} />
    </div>
  );
}
