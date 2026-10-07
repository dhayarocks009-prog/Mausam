export interface EmergencyContact {
  id: string;
  guardianName: string;
  guardianPhone: string;
  relationship: 'Mother' | 'Father' | 'Guardian' | 'Spouse' | 'Sibling' | 'Other';
  alertsEnabled: boolean;
  createdAt: number;
  lastAlertSentAt?: number;
  lastAlertEvent?: string;
  lastAlertStatus?: 'sent' | 'failed' | 'cooldown';
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  lastLogin: number;
  emergencyContact?: EmergencyContact;
}

export type AlertDeliveryStatus = 'sent' | 'failed' | 'cooldown' | 'waiting';

export interface EmergencyAlertResult {
  status: AlertDeliveryStatus;
  message: string;
  timestamp: number;
  deliveryId?: string;
  recipientPhone?: string;
  weatherEvent?: string;
  isTest?: boolean;
}

export interface EmergencyNotificationLog {
  id: string;
  timestamp: number;
  guardianName: string;
  guardianPhone: string;
  weatherEvent: string;
  location: string;
  status: AlertDeliveryStatus;
  messageText: string;
  isTest: boolean;
}
