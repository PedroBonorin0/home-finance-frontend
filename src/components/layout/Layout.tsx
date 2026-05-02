import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Tag, ScrollText } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/registros', label: 'Registros', icon: ScrollText },
  { to: '/categorias', label: 'Categorias', icon: Tag },
];

export const Layout: React.FC = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    {/* Sidebar */}
    <aside style={{
      width: 220,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 0',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)', lineHeight: 1.1 }}>
          Finanças
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
          controle pessoal
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'rgba(200,169,110,0.08)' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0 24px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        v1.0.0
      </div>
    </aside>

    {/* Main content */}
    <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <Outlet />
    </main>
  </div>
);
