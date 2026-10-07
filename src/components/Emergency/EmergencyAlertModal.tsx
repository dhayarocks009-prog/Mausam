'use client';

import React, { useState } from 'react';
import { useAuthEmergency } from '@/context/AuthEmergencyContext';
import { useWeather } from '@/context/WeatherContext';
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  User,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const EmergencyAlertModal: React.FC = () => {
  const {
    isEmergencyAlertModalOpen,
    setIsEmergencyAlertModalOpen,
    currentEmergencyAlert,
    emergencyContact,
    user,
    sendEmergencyAlert,
    setIsContactEditModalOpen,
  } = useAuthEmergency();

  const { location } = useWeather();

  const [isSending, setIsSending] = useState(false);
  const [resultStatus, setResultStatus] = useState<'sent' | 'failed' | 'cooldown' | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isEmergencyAlertModalOpen || !currentEmergencyAlert) return null;

  const alert = currentEmergencyAlert;
  const userName = user?.name || 'Dhayanidhi';
  const locationName = `${location.city}, ${location.country}`;
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const previewMessage = `Emergency Weather Alert! ${userName} is currently affected by a severe weather condition: ${alert.title} in ${locationName}. Please contact them and check whether they are safe. Alert time: ${currentTime}.`;

  const handleConfirmAlert = async () => {
    if (!emergencyContact) {
      setIsEmergencyAlertModalOpen(false);
      setIsContactEditModalOpen(true);
      return;
    }

    setIsSending(true);
    setResultStatus(null);
    setResultMessage(null);

    const result = await sendEmergencyAlert(alert, locationName);
    setIsSending(false);
    setResultStatus(result.status === 'sent' ? 'sent' : result.status === 'cooldown' ? 'cooldown' : 'failed');
    setResultMessage(result.message);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsEmergencyAlertModalOpen(false)}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          border: '2px solid var(--alert-critical)',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.4)',
        }}
      >
        {/* Header Alert Ribbon */}
        <div
          style={{
            background: 'linear-gradient(90deg, #ef4444, #b91c1c)',
            margin: '-28px -28px 20px -28px',
            padding: '16px 24px',
            borderRadius: '24px 24px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={26} className="pulse-glow" />
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>
                Safety Notification
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                EMERGENCY WEATHER ALERT
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyAlertModalOpen(false)}
            style={{ color: '#ffffff', opacity: 0.8 }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Severe Hazard Description */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertTriangle size={20} color="var(--alert-critical)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--alert-critical)' }}>
              {alert.title}
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
            {alert.description}
          </p>
          {alert.instruction && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '3px solid var(--alert-critical)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              🛡️ Safety Instruction: {alert.instruction}
            </div>
          )}
        </div>

        {/* Emergency Guardian Card Target */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Recipient Guardian
          </div>

          {emergencyContact ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {emergencyContact.guardianName} ({emergencyContact.relationship})
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Phone: {emergencyContact.guardianPhone}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: emergencyContact.alertsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: emergencyContact.alertsEnabled ? 'var(--accent-emerald)' : 'var(--alert-critical)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                {emergencyContact.alertsEnabled ? 'Alerts Active' : 'Alerts Disabled'}
              </span>
            </div>
          ) : (
            <div style={{ color: 'var(--alert-warning)', fontSize: '0.85rem' }}>
              ⚠️ No Parent/Guardian contact saved yet. Click below to add your emergency contact.
            </div>
          )}
        </div>

        {/* SMS Message Preview */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            SMS Preview to be Dispatched:
          </div>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px dashed var(--card-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
            &quot;{previewMessage}&quot;
          </div>
        </div>

        {/* Status Feedback Banner */}
        {resultStatus && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.85rem',
              fontWeight: 600,
              background:
                resultStatus === 'sent'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : resultStatus === 'cooldown'
                  ? 'rgba(249, 115, 22, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${
                resultStatus === 'sent'
                  ? 'var(--accent-emerald)'
                  : resultStatus === 'cooldown'
                  ? 'var(--alert-warning)'
                  : 'var(--alert-critical)'
              }`,
              color:
                resultStatus === 'sent'
                  ? 'var(--accent-emerald)'
                  : resultStatus === 'cooldown'
                  ? 'var(--alert-warning)'
                  : 'var(--alert-critical)',
            }}
          >
            {resultStatus === 'sent' && <CheckCircle2 size={20} />}
            {resultStatus === 'cooldown' && <Clock size={20} />}
            {resultStatus === 'failed' && <AlertCircle size={20} />}
            <div>
              <div>
                {resultStatus === 'sent' && 'Alert Sent ✓'}
                {resultStatus === 'cooldown' && 'Anti-Spam Cooldown Active'}
                {resultStatus === 'failed' && 'Alert Failed ✕'}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.9 }}>
                {resultMessage || 'Notification successfully transmitted to guardian.'}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsEmergencyAlertModalOpen(false)}
            className="header-icon-btn"
            style={{ flex: 1, padding: '14px', fontSize: '0.9rem' }}
          >
            Cancel / Close
          </button>

          {emergencyContact ? (
            <button
              onClick={handleConfirmAlert}
              disabled={isSending || resultStatus === 'sent'}
              className="layer-chip-btn active"
              style={{
                flex: 1.4,
                padding: '14px',
                fontSize: '0.95rem',
                justifyContent: 'center',
                fontWeight: 700,
                background: resultStatus === 'sent' ? 'var(--accent-emerald)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderColor: '#ef4444',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Send size={18} />
              <span>
                {isSending
                  ? 'Dispatching SMS...'
                  : resultStatus === 'sent'
                  ? 'Alert Sent ✓'
                  : 'Alert Parent / Guardian Now'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEmergencyAlertModalOpen(false);
                setIsContactEditModalOpen(true);
              }}
              className="layer-chip-btn active"
              style={{ flex: 1.4, padding: '14px', justifyContent: 'center' }}
            >
              Add Contact First
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
