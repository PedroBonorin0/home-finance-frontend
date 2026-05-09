import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Tag, ScrollText, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/registros', label: 'Registros', icon: ScrollText },
  { to: '/categorias', label: 'Categorias', icon: Tag },
  { to: '/config', label: 'Configuração', icon: Settings },
];

export const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
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
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)', lineHeight: 1.1 }}>
            Finanças
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            controle pessoal
          </div>
        </div>

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

        <div style={{ padding: '0 12px 16px' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
            <div
              style={{
                marginLeft: 'auto',
                width: 36,
                height: 20,
                borderRadius: 10,
                background: 'var(--toggle-bg)',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: theme === 'dark' ? 2 : 18,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--toggle-knob)',
                  transition: 'left 0.2s',
                }}
              />
            </div>
          </button>
        </div>

        <div style={{ padding: '0 24px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          v1.0.0
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
};
