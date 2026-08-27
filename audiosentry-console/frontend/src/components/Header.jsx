import React from 'react';
import { Search, Radar, Bell, User } from 'lucide-react';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-search-container">
        <div className="header-search-box neo-inset">
          <Search size={20} className="text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="header-search-input text-body-md text-on-surface"
          />
        </div>
      </div>
      <div className="header-actions">
        <button className="neo-button-primary header-scan-btn">
          <Radar size={20} />
          <span className="text-label-md">Run Deep Scan</span>
        </button>
        <div className="header-icons">
          <div className="header-icon-btn neo-raised text-on-surface-variant">
            <Bell size={20} />
          </div>
          <div className="header-avatar bg-primary text-on-primary">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
