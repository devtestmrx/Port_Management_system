import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LandingForm } from './components/GoodsLanding/LandingForm';
import { LandingList } from './components/GoodsLanding/LandingList';
import { ZoneManagement } from './components/Zones/ZoneManagement';
import { PlacementForm } from './components/Placement/PlacementForm';
import { PlacementList } from './components/Placement/PlacementList';
import { MovementForm } from './components/Movements/MovementForm';
import { MovementList } from './components/Movements/MovementList';
import { AuditLogViewer } from './components/Audit/AuditLog';
import { ShipsListing } from './components/LandManagement';

import {
  BarChart3,
  Package,
  Warehouse,
  MapPin,
  TruckIcon,
  FileText,
  LogOut,
  Menu,
  X,
  Ship,
} from 'lucide-react';

type View =
  | 'dashboard'
  | 'landing'
  | 'zones'
  | 'placement'
  | 'movements'
  | 'audit'
  | 'ships';

function MainApp() {
  const { user, profile, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  const canViewAudit = profile.role === 'manager' || profile.role === 'admin';

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, allowed: true },
    {
      id: 'landing',
      name: 'Goods Landing',
      icon: Package,
      allowed: true,
    },
    { id: 'zones', name: 'Zone Management', icon: Warehouse, allowed: true },
    {
      id: 'placement',
      name: 'Goods Placement',
      icon: MapPin,
      allowed: true,
    },
    { id: 'movements', name: 'Movements', icon: TruckIcon, allowed: true },
    { id: 'ships', name: 'Ships Listing', icon: Ship, allowed: true },
    { id: 'audit', name: 'Audit Log', icon: FileText, allowed: canViewAudit },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Warehouse className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">
                Port Management System
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  {profile.full_name}
                </p>
                <p className="text-xs text-slate-600">
                  {profile.role.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hidden md:flex space-x-1 py-2">
              {navigation
                .filter((item) => item.allowed)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as View)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navigation
              .filter((item) => item.allowed)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard />}

        {currentView === 'landing' && (
          <div className="space-y-6">
            <LandingForm />
            <LandingList />
          </div>
        )}

        {currentView === 'zones' && <ZoneManagement />}

        {currentView === 'placement' && (
          <div className="space-y-6">
            <PlacementForm />
            <PlacementList />
          </div>
        )}

        {currentView === 'movements' && (
          <div className="space-y-6">
            <MovementForm />
            <MovementList />
          </div>
        )}

        {currentView === 'ships' && <ShipsListing />}

        {currentView === 'audit' && canViewAudit && <AuditLogViewer />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
