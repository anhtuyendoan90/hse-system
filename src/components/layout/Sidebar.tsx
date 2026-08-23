"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_MENU } from '@/lib/constants';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {isMobileOpen && <div className="sidebar-backdrop" onClick={onMobileClose} />}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">H</div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">HSE SYSTEM</span>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          {SIDEBAR_MENU.map((group, groupIdx) => (
            <div key={groupIdx} className="sidebar-group">
              <div className="sidebar-group-label">{group.group}</div>
              {group.items.map((item) => (
                <Link 
                  key={item.key} 
                  href={(item as any).disabled ? '#' : item.href}
                  className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => isMobileOpen && onMobileClose()}
                  style={{ opacity: (item as any).disabled ? 0.5 : 1, cursor: (item as any).disabled ? 'not-allowed' : 'pointer' }}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span className="sidebar-item-text">{item.label}</span>
                  {item.key === 'notifications' && <span className="sidebar-item-badge">3</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-toggle" onClick={onToggle}>
            {isCollapsed ? '»' : '«'}
          </button>
        </div>
      </aside>
    </>
  );
}
