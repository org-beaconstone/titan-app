import { useState, type FormEvent } from 'react';
import { Save, ShieldCheck, RotateCcw } from 'lucide-react';
import { useApp } from '../../app/AppProvider';
import { Avatar, PageHeading } from '../../components/ui';
import { preferencesSchema } from '../../domain/schemas';
export default function SettingsPage() {
  const { state, savePreferences, reset } = useApp();
  const [draft, setDraft] = useState(state.preferences);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    const result = preferencesSchema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    savePreferences(result.data);
    setError('');
    setMessage('Preferences saved on this device.');
  }
  return (
    <>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Account settings"
        description="Your space, your preferences. A workspace that works for you."
      />
      <div className="settings-layout">
        <form className="panel settings-form" onSubmit={submit}>
          <div className="settings-profile">
            <Avatar name={draft.displayName || 'You'} />
            <div>
              <h2>Your profile</h2>
              <p>This is how you'll appear across Titan.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Display name
              <input
                value={draft.displayName}
                required
                maxLength={255}
                onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={draft.email}
                required
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Timezone
              <select
                value={draft.timezone}
                onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
              >
                {[
                  'UTC',
                  'America/New_York',
                  'America/Los_Angeles',
                  'Europe/London',
                  'Europe/Amsterdam',
                  'Asia/Tokyo',
                  'Australia/Sydney',
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Appearance
              <select
                aria-label="Appearance"
                value={draft.theme}
                onChange={(e) =>
                  setDraft({ ...draft, theme: e.target.value as typeof draft.theme })
                }
              >
                <option value="system">Match device</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
          <hr />
          <h2>Keep in touch</h2>
          <p className="muted">Demo preferences only. No emails or push notifications are sent.</p>
          <label className="toggle-row">
            <span>
              <strong>Weekly email digest</strong>
              <small>A considered recap of your workspace.</small>
            </span>
            <input
              type="checkbox"
              checked={draft.emailDigest}
              onChange={(e) => setDraft({ ...draft, emailDigest: e.target.checked })}
            />
          </label>
          <label className="toggle-row">
            <span>
              <strong>Mention alerts</strong>
              <small>Know when someone needs your input.</small>
            </span>
            <input
              type="checkbox"
              checked={draft.mentionAlerts}
              onChange={(e) => setDraft({ ...draft, mentionAlerts: e.target.checked })}
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="save-row">
            <button className="button primary" type="submit">
              <Save size={16} />
              Save changes
            </button>
            <p role="status">{message}</p>
          </div>
        </form>
        <aside className="panel privacy-card">
          <ShieldCheck size={28} />
          <h2>Your demo. Your device.</h2>
          <p>
            Titan runs entirely in your browser. Everything here is fictional, and your edits stay
            on this device.
          </p>
          <p>No sign-in. No backend. No tracking.</p>
          <hr />
          <h3>Start fresh</h3>
          <p>Restore the original projects, tasks, notifications and profile.</p>
          <button
            className="button secondary"
            onClick={() => {
              if (window.confirm('Reset all Titan demo changes on this device?')) {
                reset();
                setMessage('Demo reset. Reloading…');
                window.location.reload();
              }
            }}
          >
            <RotateCcw size={15} />
            Reset demo
          </button>
        </aside>
      </div>
    </>
  );
}
