// frontend/src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/icons/logo.png';
import './Navbar.css';

const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const LineupIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const PerformanceIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const SimulationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const AnomalyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="11"/><line x1="11" y1="14" x2="11.01" y2="14"/>
  </svg>
);
const PassNetworkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const TransferIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 11 21 7 17 3"/><line x1="21" y1="7" x2="3" y2="7"/>
    <polyline points="7 21 3 17 7 13"/><line x1="3" y1="17" x2="21" y2="17"/>
  </svg>
);
const TacticalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const RankingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const ComparisonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21"/><polyline points="18 9 12 3 6 9"/>
    <polyline points="6 15 12 21 18 15"/>
  </svg>
);
const ClusteringIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
    <line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/>
    <line x1="5" y1="19" x2="19" y2="19"/>
  </svg>
);

const links = [
  { path: '/',            label: 'Accueil',            icon: HomeIcon },
  { path: '/lineup',      label: 'Lineup',             icon: LineupIcon },
  { path: '/performance', label: 'Performance',        icon: PerformanceIcon },
  { path: '/simulation',  label: 'Simulation',         icon: SimulationIcon },
  { path: '/anomaly',     label: 'Anomalies',          icon: AnomalyIcon },
  { path: '/passnetwork', label: 'Réseau de Passes',   icon: PassNetworkIcon },
  { path: '/transfer',    label: 'Transferts',         icon: TransferIcon },
  { path: '/tactical',    label: 'Tactique',           icon: TacticalIcon },
  { path: '/ranking',     label: 'Classement',         icon: RankingIcon },
  { path: '/comparison',  label: 'Comparaison',        icon: ComparisonIcon },
  { path: '/clustering',  label: 'Talents & Clusters', icon: ClusteringIcon },
];

// ← onCollapse est reçu depuis App.js
function Navbar({ onCollapse }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (onCollapse) onCollapse(next); // ← notifie App.js
  };

  return (
    <nav className={`navbar ${collapsed ? 'collapsed' : ''}`}>

      <Link to="/" className="navbar-logo">
        <img
          src={logo}
          alt="SmartLineup Logo"
          style={{
            width: collapsed ? '40px' : '90px',
            height: collapsed ? '40px' : '90px',
            objectFit: 'contain',
            transition: 'all 0.3s ease'
          }}
        />
      </Link>

      <div className="navbar-links">
        {links.map(link => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="navbar-link-icon"><Icon /></span>
              {!collapsed && <span className="navbar-link-label">   {link.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Toggle collapse button */}
      <button className="navbar-toggle" onClick={handleCollapse}>
        {collapsed ? '→' : '←'}
      </button>

      {/* Mobile burger */}
      <button className="navbar-burger" onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="navbar-mobile">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="navbar-mobile-link"
                onClick={() => setOpen(false)}
              >
                <Icon />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

    </nav>
  );
}

export default Navbar;