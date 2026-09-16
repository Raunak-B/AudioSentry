import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Activity, Gavel, Network, History, Bot } from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Overview" },
    { to: "/monitor", icon: Activity, label: "Live Monitor" },
    { to: "/compliance-bot", icon: Bot, label: "Compliance Bot (Beta)" },
    { to: "/deep-scan", icon: Gavel, label: "Deep Scan" },
    { to: "/alerts", icon: Network, label: "Alerts" },
    { to: "/audit", icon: History, label: "Audit Logs" },
    { to: "/enrollment", icon: Activity, label: "Enrollment" },
    { to: "/test", icon: Shield, label: "Test Mode" }
  ];

  return (
    <aside className="sidebar neo-sidebar-ridge">
      <div className="sidebar-header">
        <div className="sidebar-logo neo-raised text-primary">
          <Shield size={24} />
        </div>
        <span className="text-headline-md text-on-surface-variant sidebar-title">
          FRAUD CORE
        </span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'neo-inset active-link' : ''}`
            }
          >
            <item.icon className="sidebar-icon" size={20} />
            <span className="text-label-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
