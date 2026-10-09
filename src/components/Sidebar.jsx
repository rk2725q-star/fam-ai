import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ScanLine,
  Droplets,
  Sprout,
  BookOpen,
  CloudSun,
  MapPin,
  Settings,
  X,
} from 'lucide-react';


const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/disease-detection', label: 'Disease Detection', icon: ScanLine },
  { to: '/irrigation', label: 'Irrigation Guide', icon: Droplets },
  { to: '/crop-management', label: 'Crop Management', icon: Sprout },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/weather', label: 'Weather', icon: CloudSun },
  { to: '/fields', label: 'My Fields', icon: MapPin },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const cls = [
    'sidebar',
    collapsed ? 'sidebar--collapsed' : '',
    open ? 'sidebar--open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {open && <div className="sidebar__overlay" onClick={onClose} />}
      <aside className={cls}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
                <img src="/farm-logo.png" alt="Farm AI" />  
            </div>
          <div className="sidebar__brand-text">
            <h1>Farm AI</h1>
            <p>Smart Farming. Better Decisions.</p>
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__section-label">Menu</div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
              title={collapsed ? label : undefined}
            >
              <span className="sidebar__link-icon">
                <Icon size={19} strokeWidth={2} />
              </span>
              <span className="sidebar__link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__promo">
  <img
    className="sidebar__promo-bg"
    src="/left-corner-image.png"
    alt=""
    aria-hidden="true"
  />
  <div className="sidebar__promo-content">
    <h4>Better Knowledge<br />Healthier Crops<br />Brighter Tomorrow</h4>
    <p>AI-powered guidance for every farming decision.</p>
  </div>
</div>
      </aside>
    </>
  );
}