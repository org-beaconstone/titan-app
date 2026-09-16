import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers3, Search, X, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../app/AppProvider';
import { members, DEMO_TODAY } from '../../data/fixtures';
import { filterProjects } from '../../domain/project-policy';
import { projectInputSchema } from '../../domain/schemas';
import type { ProjectStatus } from '../../domain/types';
import { Avatar, Badge, EmptyState, formatDate, PageHeading } from '../../components/ui';
export default function ProjectsPage() {
  const { state, addProject } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (params.get('create')) dialog.current?.showModal();
  }, [params]);
  const visible = filterProjects(state.projects, query, status);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = projectInputSchema.safeParse({
      name: form.get('name'),
      description: form.get('description'),
      dueDate: form.get('dueDate'),
      ownerId: form.get('ownerId'),
      status: 'on-track',
      color: '#ee6d36',
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    addProject(result.data);
    setQuery('');
    setStatus('all');
    setAnnouncement(`Created ${result.data.name}`);
    e.currentTarget.reset();
    dialog.current?.close();
  }
  return (
    <>
      <PageHeading
        eyebrow="BUILD SOMETHING THAT MATTERS"
        title="Projects"
        description="From first idea to final milestone. Keep the whole picture in view."
        action={
          <button
            className="button primary"
            onClick={() => {
              setError('');
              dialog.current?.showModal();
            }}
          >
            + New project
          </button>
        }
      />
      <div role="status" className="sr-only">
        {announcement}
      </div>
      <div className="filter-bar">
        <div className="segmented">
          {(['all', 'on-track', 'at-risk', 'completed'] as const).map((s) => (
            <button key={s} aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === 'all'
                ? 'All projects'
                : s === 'on-track'
                  ? 'On track'
                  : s === 'at-risk'
                    ? 'At risk'
                    : 'Completed'}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Filter projects"
            placeholder="Find a project…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="project-grid">
        {visible.map((p) => {
          const owner = members.find((m) => m.id === p.ownerId);
          return (
            <article className="project-card" key={p.id}>
              <div className="project-card-top">
                <span
                  className="project-glyph"
                  style={{ background: p.color + '18', color: p.color }}
                >
                  <Layers3 size={24} />
                </span>
                <Badge status={p.status} />
              </div>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <div className="progress-label">
                <span>Progress</span>
                <strong>{p.progress}%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${p.progress}%`, background: p.color }} />
              </div>
              <div className="project-card-footer">
                <div>
                  <Avatar name={owner?.name || 'Unknown'} color={owner?.color} small />
                  <span>{owner?.name.split(' ')[0] || 'Unassigned'}</span>
                </div>
                <span>Due {formatDate(p.dueDate)}</span>
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <EmptyState title="No projects found">
          Try another search or create something new.
        </EmptyState>
      )}
      <div className="project-hint">
        <ArrowUpRight size={18} />
        <p>Every great project starts with a small step. Create yours above.</p>
      </div>
      <dialog ref={dialog} className="modal" aria-labelledby="new-project-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">A FRESH START</span>
            <h2 id="new-project-title">Create a project</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            Project name
            <input
              name="name"
              required
              maxLength={255}
              autoFocus
              placeholder="Something worth building"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              maxLength={1000}
              rows={3}
              placeholder="What will this project make possible?"
            />
          </label>
          <div className="form-grid">
            <label>
              Due date
              <input name="dueDate" required type="date" defaultValue={DEMO_TODAY} />
            </label>
            <label>
              Project owner
              <select name="ownerId">
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button className="button primary" type="submit">
              Create project
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
