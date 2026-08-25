import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './Layout.css';

export function Layout({ children }) {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-content-wrapper">
        <Header />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
}
