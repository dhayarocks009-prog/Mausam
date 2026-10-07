'use client';

import React, { useState } from 'react';
import { useAuthEmergency } from '@/context/AuthEmergencyContext';
import {
  ShieldAlert,
  User,
  Phone,
  Bell,
  BellOff,
  Edit2,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
} from 'lucide-react';

export const EmergencyContactCard: React.FC = () => {
  const {
    emergencyContact,
    setIsContactEditModalOpen,
    toggleEmergencyAlerts,
    sendTestAlert,
  } = useAuthEmergency();

  const [testStatusMessage, setTestStatusMessage] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  // Mask phone number for privacy (e.g. "+91 ••••• ••123")
  const maskPhone = (phone: string) => {
    if (!phone) return '••••••';
    const cleaned = phone.trim();
    if (cleaned.length <= 4) return '••••' + cleaned;
    const lastDigits = cleaned.slice(-4);
    const prefix = cleaned.slice(0, 3);
    return `${prefix} ••••• ••${lastDigits}`;
  };

  const handleTestAlert = async () => {
    if (!emergencyContact) {
      setIsContactEditModalOpen(true);
      return;
    }

    setIsSendingTest(true);
    setTestStatusMessage('Dispatching test notification...');

    const result = await sendTestAlert();
    setIsSendingTest(false);

    if (result.status === 'sent') {
      setTestStatusMessage('Test Alert Sent ✓ (Check phone inbox)');
    } else if (result.status === 'cooldown') {
      setTestStatusMessage(result.message);
    } else {
      setTestStatusMessage('Test Alert Failed ✕ Please check number format.');
    }

    setTimeout(() => setTestStatusMessage(null), 6000);
  };

  return (
    <div className="glass-card" style={{ padding: '22px', borderLeft: '4px solid var(--accent-cyan)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 210, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Emergency Contact</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Automatic severe weather alerts for your parent/guardian
            </p>
          </div>
        </div>

        {emergencyContact && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: emergencyContact.alertsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: emergencyContact.alertsEnabled ? 'var(--accent-emerald)' : 'var(--alert-critical)',
              border: `1px solid ${emergencyContact.alertsEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {emergencyContact.alertsEnabled ? '🔔 Alerts: ON' : '🔕 Alerts: OFF'}
          </span>
        )}
      </div>

      {emergencyContact ? (
        <div>
          {/* Details Box */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.95rem' }}>
                <User size={16} color="var(--accent-cyan)" />
                <span>{emergencyContact.guardianName}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  ({emergencyContact.relationship})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Phone size={15} color="#94a3b8" />
              <span>{maskPhone(emergencyContact.guardianPhone)}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Lock size={11} /> Protected
              </span>
            </div>

            {/* Last Alert Status Display */}
            {emergencyContact.lastAlertStatus && (
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 8,
                  borderTop: '1px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                }}
              >
                {emergencyContact.lastAlertStatus === 'sent' && (
                  <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Alert Sent ✓ ({emergencyContact.lastAlertEvent || 'Severe Weather'})
                  </span>
                )}
                {emergencyContact.lastAlertStatus === 'cooldown' && (
                  <span style={{ color: 'var(--alert-warning)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> Anti-Spam Cooldown Active
                  </span>
                )}
                {emergencyContact.lastAlertStatus === 'failed' && (
                  <span style={{ color: 'var(--alert-critical)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={13} /> Alert Failed ✕
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Test Alert Status Banner */}
          {testStatusMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: testStatusMessage.includes('Sent')
                  ? 'rgba(16, 185, 129, 0.15)'
                  : testStatusMessage.includes('Failed')
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(0, 210, 255, 0.15)',
                border: '1px solid var(--card-border)',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: 14,
                color: 'var(--text-primary)',
              }}
            >
              {testStatusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              onClick={() => setIsContactEditModalOpen(true)}
              className="layer-chip-btn"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Edit2 size={14} />
              <span>Edit Contact</span>
            </button>

            <button
              onClick={handleTestAlert}
              disabled={isSendingTest}
              className="layer-chip-btn"
              style={{ padding: '8px 14px', fontSize: '0.82rem', background: 'rgba(0, 210, 255, 0.1)' }}
            >
              <Send size={14} color="var(--accent-cyan)" />
              <span>{isSendingTest ? 'Sending...' : 'Test Alert'}</span>
            </button>

            <button
              onClick={() => toggleEmergencyAlerts(!emergencyContact.alertsEnabled)}
              className="layer-chip-btn"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                color: emergencyContact.alertsEnabled ? 'var(--alert-critical)' : 'var(--accent-emerald)',
              }}
            >
              {emergencyContact.alertsEnabled ? <BellOff size={14} /> : <Bell size={14} />}
              <span>{emergencyContact.alertsEnabled ? 'Disable Alerts' : 'Enable Alerts'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            No emergency guardian contact configured yet. Add your parent/guardian to notify them automatically if serious severe weather strikes your area.
          </p>
          <button
            onClick={() => setIsContactEditModalOpen(true)}
            className="layer-chip-btn active"
            style={{ padding: '10px 20px', margin: '0 auto', fontSize: '0.9rem' }}
          >
            <span>+ Add Parent / Guardian Contact</span>
          </button>
        </div>
      )}
    </div>
  );
};
