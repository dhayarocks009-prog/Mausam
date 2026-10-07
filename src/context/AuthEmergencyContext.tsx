'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  EmergencyContact,
  EmergencyAlertResult,
  EmergencyNotificationLog,
} from '@/types/auth';
import { WeatherAlert } from '@/types/weather';

interface AuthEmergencyContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  activeUserCount: number;
  emergencyContact: EmergencyContact | null;
  notificationLogs: EmergencyNotificationLog[];
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isContactEditModalOpen: boolean;
  setIsContactEditModalOpen: (open: boolean) => void;
  isEmergencyAlertModalOpen: boolean;
  setIsEmergencyAlertModalOpen: (open: boolean) => void;
  currentEmergencyAlert: WeatherAlert | null;
  setCurrentEmergencyAlert: (alert: WeatherAlert | null) => void;
  lastAlertStatus: 'sent' | 'failed' | 'cooldown' | 'waiting' | null;
  login: (name: string, identifier: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  saveEmergencyContact: (contact: Omit<EmergencyContact, 'id' | 'createdAt'>) => void;
  deleteEmergencyContact: () => void;
  toggleEmergencyAlerts: (enabled: boolean) => void;
  sendEmergencyAlert: (alert: WeatherAlert, locationName: string) => Promise<EmergencyAlertResult>;
  sendTestAlert: () => Promise<EmergencyAlertResult>;
  triggerEmergencyModalForAlert: (alert: WeatherAlert) => void;
}

const STORAGE_USER_KEY = 'mausam_auth_user';
const STORAGE_CONTACT_KEY = 'mausam_emergency_contact';
const STORAGE_LOGS_KEY = 'mausam_emergency_logs';

const AuthEmergencyContext = createContext<AuthEmergencyContextType | undefined>(undefined);

export function AuthEmergencyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeUserCount, setActiveUserCount] = useState<number>(142);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<EmergencyNotificationLog[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isContactEditModalOpen, setIsContactEditModalOpen] = useState<boolean>(false);
  const [isEmergencyAlertModalOpen, setIsEmergencyAlertModalOpen] = useState<boolean>(false);
  const [currentEmergencyAlert, setCurrentEmergencyAlert] = useState<WeatherAlert | null>(null);
  const [lastAlertStatus, setLastAlertStatus] = useState<'sent' | 'failed' | 'cooldown' | 'waiting' | null>(null);

  // Initialize from LocalStorage and fetch live active user count
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Default guest user preview
        setUser({
          id: 'usr_guest_demo',
          name: 'Dhayanidhi',
          mobile: '+91 98765 43210',
          isLoggedIn: true,
          lastLogin: Date.now(),
        });
      }

      const storedContact = localStorage.getItem(STORAGE_CONTACT_KEY);
      if (storedContact) {
        setEmergencyContact(JSON.parse(storedContact));
      } else {
        // Default starter emergency contact for immediate testing
        const defaultContact: EmergencyContact = {
          id: 'contact_default',
          guardianName: 'Arun Kumar',
          guardianPhone: '+91 98765 12345',
          relationship: 'Father',
          alertsEnabled: true,
          createdAt: Date.now(),
        };
        setEmergencyContact(defaultContact);
        localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(defaultContact));
      }

      const storedLogs = localStorage.getItem(STORAGE_LOGS_KEY);
      if (storedLogs) {
        setNotificationLogs(JSON.parse(storedLogs));
      }
    } catch (e) {
      console.warn('Could not read auth/emergency storage:', e);
    }

    // Fetch active users count from backend
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => {
        if (d.activeUserCount) setActiveUserCount(d.activeUserCount);
      })
      .catch((e) => console.warn('Could not fetch active user count:', e));

    // Periodic check every 45s
    const interval = setInterval(() => {
      fetch('/api/auth')
        .then((r) => r.json())
        .then((d) => {
          if (d.activeUserCount) setActiveUserCount(d.activeUserCount);
        })
        .catch(() => { });
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Login handler
  const login = useCallback(async (name: string, identifier: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, identifier }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setActiveUserCount(data.activeUserCount);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
      }
      setIsLoginModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    if (user) {
      try {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logout: true, userId: user.id }),
        });
      } catch { }
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  // Save Emergency Contact
  const saveEmergencyContact = useCallback((contactData: Omit<EmergencyContact, 'id' | 'createdAt'>) => {
    const updated: EmergencyContact = {
      ...contactData,
      id: emergencyContact?.id || `contact_${Date.now()}`,
      createdAt: emergencyContact?.createdAt || Date.now(),
    };
    setEmergencyContact(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(updated));
    }
    setIsContactEditModalOpen(false);
  }, [emergencyContact]);

  // Delete Emergency Contact
  const deleteEmergencyContact = useCallback(() => {
    setEmergencyContact(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_CONTACT_KEY);
    }
  }, []);

  // Toggle Alerts ON/OFF
  const toggleEmergencyAlerts = useCallback((enabled: boolean) => {
    if (!emergencyContact) return;
    const updated = { ...emergencyContact, alertsEnabled: enabled };
    setEmergencyContact(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(updated));
    }
  }, [emergencyContact]);

  // Send Emergency Alert (Connected to severe weather)
  const sendEmergencyAlert = useCallback(
    async (alert: WeatherAlert, locationName: string): Promise<EmergencyAlertResult> => {
      if (!emergencyContact) {
        return { status: 'failed', message: 'No emergency contact registered', timestamp: Date.now() };
      }

      setLastAlertStatus('waiting');

      try {
        const res = await fetch('/api/emergency/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user?.name || 'Dhayanidhi',
            guardianName: emergencyContact.guardianName,
            guardianPhone: emergencyContact.guardianPhone,
            weatherEvent: alert.title,
            location: locationName,
            userConfirmed: true,
            isTest: false,
          }),
        });

        const data: EmergencyAlertResult = await res.json();
        setLastAlertStatus(data.status);

        // Update contact last alert time
        const updatedContact: EmergencyContact = {
          ...emergencyContact,
          lastAlertSentAt: Date.now(),
          lastAlertEvent: alert.title,
          lastAlertStatus: data.status === 'sent' ? 'sent' : data.status === 'cooldown' ? 'cooldown' : 'failed',
        };
        setEmergencyContact(updatedContact);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(updatedContact));
        }

        // Add to notification logs
        const logItem: EmergencyNotificationLog = {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          guardianName: emergencyContact.guardianName,
          guardianPhone: emergencyContact.guardianPhone,
          weatherEvent: alert.title,
          location: locationName,
          status: data.status,
          messageText: data.message,
          isTest: false,
        };
        const nextLogs = [logItem, ...notificationLogs.slice(0, 19)];
        setNotificationLogs(nextLogs);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(nextLogs));
        }

        return data;
      } catch (err: any) {
        setLastAlertStatus('failed');
        return { status: 'failed', message: err?.message || 'Dispatch failed', timestamp: Date.now() };
      }
    },
    [emergencyContact, user, notificationLogs]
  );

  // Send Test Alert
  const sendTestAlert = useCallback(async (): Promise<EmergencyAlertResult> => {
    if (!emergencyContact) {
      return { status: 'failed', message: 'No emergency contact registered', timestamp: Date.now() };
    }

    setLastAlertStatus('waiting');

    try {
      const res = await fetch('/api/emergency/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user?.name || 'Dhayanidhi',
          guardianName: emergencyContact.guardianName,
          guardianPhone: emergencyContact.guardianPhone,
          weatherEvent: 'System Verification Test',
          location: 'Current Location',
          userConfirmed: true,
          isTest: true,
        }),
      });

      const data: EmergencyAlertResult = await res.json();
      setLastAlertStatus(data.status);

      // Add to logs
      const logItem: EmergencyNotificationLog = {
        id: `test_log_${Date.now()}`,
        timestamp: Date.now(),
        guardianName: emergencyContact.guardianName,
        guardianPhone: emergencyContact.guardianPhone,
        weatherEvent: 'System Verification Test',
        location: 'Current Location',
        status: data.status,
        messageText: data.message,
        isTest: true,
      };
      const nextLogs = [logItem, ...notificationLogs.slice(0, 19)];
      setNotificationLogs(nextLogs);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(nextLogs));
      }

      return data;
    } catch (err: any) {
      setLastAlertStatus('failed');
      return { status: 'failed', message: err?.message || 'Test dispatch failed', timestamp: Date.now() };
    }
  }, [emergencyContact, user, notificationLogs]);

  // Open emergency modal for a specific alert
  const triggerEmergencyModalForAlert = useCallback((alert: WeatherAlert) => {
    setCurrentEmergencyAlert(alert);
    setIsEmergencyAlertModalOpen(true);
  }, []);
  return (
    <AuthEmergencyContext.Provider
      value={{
        user,
        isLoggedIn: !!user?.isLoggedIn,
        activeUserCount,
        emergencyContact,
        notificationLogs,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isContactEditModalOpen,
        setIsContactEditModalOpen,
        isEmergencyAlertModalOpen,
        setIsEmergencyAlertModalOpen,
        currentEmergencyAlert,
        setCurrentEmergencyAlert,
        lastAlertStatus,
        login,
        logout,
        saveEmergencyContact,
        deleteEmergencyContact,
        toggleEmergencyAlerts,
        sendEmergencyAlert,
        sendTestAlert,
        triggerEmergencyModalForAlert,
      }}
    >
      {children}
    </AuthEmergencyContext.Provider>
  );
}

export function useAuthEmergency() {
  const context = useContext(AuthEmergencyContext);
  if (!context) {
    throw new Error('useAuthEmergency must be used within an AuthEmergencyProvider');
  }
  return context;
}