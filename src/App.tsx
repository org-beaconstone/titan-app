import { BrowserRouter, NavLink, Route, Routes, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers3,
  Bell,
  Settings2,
  ArrowUpRight,
  Search,
  Menu,
  X,
  Sparkles,
  CircleHelp,
} from 'lucide-react';
import { useState } from 'react';
import { AppProvider, useApp } from './app/AppProvider';
import DashboardPage from './features/dashboard/DashboardPage';
import ProjectsPage from './features/projects/ProjectsPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import SettingsPage from './features/settings/SettingsPage';
import { Avatar } from './components/ui';
import './index.css';
const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Layers3 },
  { to: '/notifications', label: 'Inbox', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings2 },
];
function Shell() {
  const { state, unread, storageAvailable } = useApp();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <Link to="/" className="brand" onClick={() => setMenu(false)}>
          <img src="/titan.svg" alt="" />
          titan<span>®</span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-switch">
          <span className="workspace-icon">N</span>
          <div>
            <strong>Northstar Studio</strong>
            <small>Team workspace</small>
          </div>
          <span className="plan-label">PRO</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Workspace">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink end={to === '/'} key={to} to={to} onClick={() => setMenu(false)}>
              <Icon size={19} />
              {label}
              {to === '/notifications' && unread > 0 && (
                <span className="nav-count" aria-label={`${unread} unread notifications`}>
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="idea-card">
            <Sparkles size={21} />
            <strong>Space for your next big idea.</strong>
            <p>Bring your projects, people and progress together.</p>
            <Link to="/projects">
              Explore projects <ArrowUpRight size={16} />
            </Link>
          </div>
          <a
            href="https://github.com/topics/react"
            target="_blank"
            rel="noreferrer"
            className="help-link"
          >
            <CircleHelp size={17} />
            Built with modern web tools <ArrowUpRight size={14} />
          </a>
          <div className="sidebar-profile">
            <Avatar name={state.preferences.displayName} />
            <div>
              <strong>{state.preferences.displayName}</strong>
              <small>Workspace owner · Demo</small>
            </div>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-overlay"
          aria-label="Dismiss navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main-wrap">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>{links.find((l) => l.to === location.pathname)?.label || 'Page'}</strong>
          </div>
          <div className="top-actions">
            <form action="/projects" className="global-search">
              <Search size={16} />
              <input
                name="q"
                aria-label="Search projects"
                placeholder="Search projects…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <span className="demo-pill">
              <i /> DEMO WORKSPACE
            </span>
            <Link
              className="notification-button"
              to="/notifications"
              aria-label={`Inbox, ${unread} unread`}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </Link>
            <Link to="/settings" aria-label="Account settings">
              <Avatar name={state.preferences.displayName} small />
            </Link>
          </div>
        </header>
        {!storageAvailable && (
          <div role="status" className="storage-warning">
            Browser storage is unavailable. Changes will last only for this session.
          </div>
        )}
        <main id="main">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h1>That page took a detour.</h1>
                  <Link to="/">Back to overview</Link>
                </div>
              }
            />
          </Routes>
          <footer className="page-footer">
            <span>Made for work that matters.</span>
            <span>Titan / Fictional workspace · Reference date Sep 15, 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProvider>
  );
}
