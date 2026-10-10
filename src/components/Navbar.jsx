import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, ShieldCheck, LayoutDashboard, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard' || (role === 'EMPLOYEE' && location.pathname === '/');

  return (
    <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '14px 28px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'var(--accent-gradient)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <Users size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EmpManager
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Employee Management Portal
              </p>
            </div>
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
              <Link
                to={role === 'EMPLOYEE' ? '/' : '/dashboard'}
                className={`btn ${isDashboard ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <UserCheck size={14} />
                <span>My Dashboard</span>
              </Link>

              {role !== 'EMPLOYEE' && (
                <Link
                  to="/"
                  className={`btn ${!isDashboard ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <LayoutDashboard size={14} />
                  <span>Employee Directory</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.username}
                </span>
                <span className={`role-badge ${role}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                  <ShieldCheck size={10} />
                  {role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              title="Log out of system"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
