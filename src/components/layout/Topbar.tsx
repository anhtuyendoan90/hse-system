"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth';

interface TopbarProps {
  isSidebarCollapsed: boolean;
  onMobileToggle: () => void;
  user: AuthUser | null;
}

export function Topbar({ isSidebarCollapsed, onMobileToggle, user }: TopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className={`topbar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onMobileToggle}>
          ☰
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-item"><a href="/dashboard">HSE System</a></span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <span className="topbar-search-icon">🔍</span>
          <input type="text" className="topbar-search-input" placeholder="Tìm kiếm toàn hệ thống... (Ctrl+K)" />
        </div>

        <button className="notification-bell" onClick={() => router.push('/notifications')}>
          🔔
          <span className="notification-bell-badge">3</span>
        </button>

        <div className="user-menu" onClick={handleLogout} title="Nhấn để đăng xuất">
          <div className="user-avatar">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.fullName || 'Người dùng'}</span>
            <span className="user-role">{user?.roleName || 'Vai trò'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
