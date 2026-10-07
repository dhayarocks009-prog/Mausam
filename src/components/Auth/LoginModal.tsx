'use client';

import React, { useState } from 'react';
import { useAuthEmergency } from '@/context/AuthEmergencyContext';
import { User, Phone, Mail, X, Users, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    user,
    isLoggedIn,
    login,
    logout,
    activeUserCount,
  } = useAuthEmergency();

  const [name, setName] = useState(user?.name || '');
  const [identifier, setIdentifier] = useState(user?.mobile || user?.email || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(name, identifier);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setName('');
    setIdentifier('');
    setIsLoginModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {isLoggedIn ? 'User Account' : 'Sign In to Mausam'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personalized weather & emergency guardian alerts
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="header-icon-btn"
            style={{ width: 32, height: 32 }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Active Users Counter Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 210, 255, 0.08)',
            border: '1px solid rgba(0, 210, 255, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)' }}>
            <Users size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active Online Community</span>
          </div>
          <div
            style={{
              background: 'var(--accent-cyan)',
              color: '#050b17',
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {activeUserCount} Active Users
          </div>
        </div>

        {isLoggedIn ? (
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {user?.mobile && <span>📱 {user.mobile}</span>}
                {user?.email && <span>✉️ {user.email}</span>}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                  fontSize: '0.75rem',
                  color: 'var(--accent-emerald)',
                }}
              >
                <CheckCircle size={14} />
                <span>Session Active • Weather alerts synced</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleLogout}
                className="header-icon-btn"
                style={{ flex: 1, padding: '12px', color: 'var(--alert-critical)', fontWeight: 600 }}
              >
                Sign Out / Switch Account
              </button>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="layer-chip-btn active"
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid var(--alert-critical)',
                  color: 'var(--alert-critical)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}

            {/* Name Input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <div className="search-input-wrap" style={{ margin: 0 }}>
                <User size={18} className="search-input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhayanidhi"
                  className="search-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile / Email Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Mobile Number or Email Address
              </label>
              <div className="search-input-wrap" style={{ margin: 0 }}>
                <Phone size={18} className="search-input-icon" />
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210 or name@example.com"
                  className="search-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Enter either your 10-digit mobile number or standard email address.
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="layer-chip-btn active"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                justifyContent: 'center',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
