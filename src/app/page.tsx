'use client';

import React from 'react';
import { WeatherProvider, useWeather } from '@/context/WeatherContext';
import { AuthEmergencyProvider } from '@/context/AuthEmergencyContext';
import { Header } from '@/components/Header/Header';
import { Sidebar } from '@/components/Navigation/Sidebar';
import { BottomNav } from '@/components/Navigation/BottomNav';
import { HomeDashboard } from '@/components/Dashboard/HomeDashboard';
import { WeatherMap } from '@/components/Map/WeatherMap';
import { FavoritesView } from '@/components/Favorites/FavoritesView';
import { AlertsView } from '@/components/Alerts/AlertsView';
import { SettingsView } from '@/components/Settings/SettingsView';
import { LocationSearchModal } from '@/components/Search/LocationSearchModal';
import { OnboardingModal } from '@/components/Onboarding/OnboardingModal';
import { LoginModal } from '@/components/Auth/LoginModal';
import { EmergencyAlertModal } from '@/components/Emergency/EmergencyAlertModal';
import { EmergencyContactEditModal } from '@/components/Emergency/EmergencyContactEditModal';

function MainApp() {
  const { activeTab } = useWeather();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'map':
        return <WeatherMap />;
      case 'favorites':
        return <FavoritesView />;
      case 'alerts':
        return <AlertsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="mausam-app-container">
      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="mausam-main-content">
        <Header />

        <main className="dashboard-page-container" style={{ marginTop: '20px' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Dialog Modals */}
      <LocationSearchModal />
      <OnboardingModal />

      {/* Auth & Emergency Modals */}
      <LoginModal />
      <EmergencyAlertModal />
      <EmergencyContactEditModal />
    </div>
  );
}

export default function Page() {
  return (
    <WeatherProvider>
      <AuthEmergencyProvider>
        <MainApp />
      </AuthEmergencyProvider>
    </WeatherProvider>
  );
}
