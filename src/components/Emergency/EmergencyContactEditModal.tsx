'use client';

import React, { useState, useEffect } from 'react';
import { useAuthEmergency } from '@/context/AuthEmergencyContext';
import { Shield, User, Phone, Users, X, Check, Trash2, Lock } from 'lucide-react';

export const EmergencyContactEditModal: React.FC = () => {
  const {
    isContactEditModalOpen,
    setIsContactEditModalOpen,
    emergencyContact,
    saveEmergencyContact,
    deleteEmergencyContact,
  } = useAuthEmergency();

  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [relationship, setRelationship] = useState<'Mother' | 'Father' | 'Guardian' | 'Spouse' | 'Sibling' | 'Other'>('Father');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emergencyContact) {
      setGuardianName(emergencyContact.guardianName);
      setGuardianPhone(emergencyContact.guardianPhone);
      setRelationship(emergencyContact.relationship);
      setAlertsEnabled(emergencyContact.alertsEnabled);
    } else {
      setGuardianName('');
      setGuardianPhone('');
      setRelationship('Father');
      setAlertsEnabled(true);
    }
    setError(null);
  }, [emergencyContact, isContactEditModalOpen]);

  if (!isContactEditModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName.trim() || guardianName.trim().length < 2) {
      setError('Please enter your parent or guardian name.');
      return;
    }
    if (!guardianPhone.trim() || guardianPhone.trim().length < 8) {
      setError('Please enter a valid phone number with country code (e.g. +91 98765 12345).');
      return;
    }

    saveEmergencyContact({
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      relationship,
      alertsEnabled,
    });
  };

  const handleDelete = () => {
    deleteEmergencyContact();
    setIsContactEditModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsContactEditModalOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 210, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {emergencyContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Guardian contact for severe weather safety alerts
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsContactEditModalOpen(false)}
            className="header-icon-btn"
            style={{ width: 32, height: 32 }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

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

        <form onSubmit={handleSave}>
          {/* Guardian Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Parent / Guardian Name
            </label>
            <div className="search-input-wrap" style={{ margin: 0 }}>
              <User size={18} className="search-input-icon" />
              <input
                type="text"
                required
                placeholder="e.g. Arun Kumar"
                className="search-input"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
            </div>
          </div>

          {/* Guardian Phone */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Phone Number (SMS Enabled)
            </label>
            <div className="search-input-wrap" style={{ margin: 0 }}>
              <Phone size={18} className="search-input-icon" />
              <input
                type="tel"
                required
                placeholder="+91 98765 12345"
                className="search-input"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Include your country code for SMS delivery (e.g. +91 for India).
            </div>
          </div>

          {/* Relationship */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Relationship
            </label>
            <select
              value={relationship}
              onChange={(e: any) => setRelationship(e.target.value)}
              className="search-input"
              style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <option value="Father" style={{ background: '#111a2f' }}>Father</option>
              <option value="Mother" style={{ background: '#111a2f' }}>Mother</option>
              <option value="Guardian" style={{ background: '#111a2f' }}>Legal Guardian</option>
              <option value="Spouse" style={{ background: '#111a2f' }}>Spouse</option>
              <option value="Sibling" style={{ background: '#111a2f' }}>Sibling</option>
              <option value="Other" style={{ background: '#111a2f' }}>Other Family Member</option>
            </select>
          </div>

          {/* Alerts Enabled Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Enable Emergency Weather Alerts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Allows emergency alerts to be dispatched when severe weather strikes
              </div>
            </div>
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Privacy Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              marginBottom: 20,
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Lock size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent-cyan)' }} />
            <span>
              <strong>Privacy Guarantee:</strong> Guardian phone numbers are stored securely and never shared with third parties. Alerts are only dispatched when confirmed or enabled.
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {emergencyContact && (
              <button
                type="button"
                onClick={handleDelete}
                className="header-icon-btn"
                style={{ color: 'var(--alert-critical)', padding: '0 16px', gap: 6 }}
                title="Delete Contact"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}

            <button
              type="submit"
              className="layer-chip-btn active"
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '0.95rem',
                justifyContent: 'center',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Check size={18} />
              <span>Save Emergency Contact</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
