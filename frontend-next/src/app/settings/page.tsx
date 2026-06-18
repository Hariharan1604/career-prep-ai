'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { User, Mail, Lock, Shield, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'privacy'>('profile');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);
  const [productUpdates, setProductUpdates] = useState(true);
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState<{ type: string; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: string; text: string } | null>(null);
  const [preferencesMessage, setPreferencesMessage] = useState<{ type: string; text: string } | null>(null);
  const [dangerMessage, setDangerMessage] = useState<{ type: string; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);
    
    // Simulate API call for now (matches legacy functionality)
    setTimeout(() => {
      setIsUpdatingProfile(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    }, 1000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordMessage(null);
    
    if (newPassword.length < 6) {
      setIsUpdatingPassword(false);
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    
    // Simulate API call for now (matches legacy functionality)
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
    }, 1000);
  };

  const handleSavePreferences = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingPreferences(true);
    setPreferencesMessage(null);

    setTimeout(() => {
      setIsUpdatingPreferences(false);
      setPreferencesMessage({ type: 'success', text: 'Preferences saved successfully.' });
    }, 1000);
  };

  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('themeMode') : null;
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
      setThemeMode(storedTheme);
      applyTheme(storedTheme);
    } else {
      setThemeMode('system');
      applyTheme('system');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('themeMode', themeMode);
    applyTheme(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  const applyTheme = (mode: 'system' | 'light' | 'dark') => {
    const root = document.documentElement;
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
      root.dataset.theme = mode;
    }
  };

  const handleDeleteAccount = () => {
    setIsDeletingAccount(true);
    setDangerMessage(null);

    setTimeout(() => {
      setIsDeletingAccount(false);
      setDangerMessage({ type: 'error', text: 'Account deletion is not available in this demo.' });
    }, 1000);
  };

  const handleSignOut = () => {
    setDangerMessage({ type: 'success', text: 'Signed out locally. Implement auth handling in backend to complete this flow.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Account Settings</h2>
        <p className="text-[var(--color-muted)] mt-1">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Navigation/Summary */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-[var(--color-accent)] border border-blue-100 flex items-center justify-center mb-4">
              <User className="w-10 h-10" />
            </div>
            <h3 className="font-semibold text-[var(--color-foreground)]">{user?.full_name || fullName || 'Your Name'}</h3>
            <p className="text-sm text-[var(--color-muted)]">{user?.email || 'you@example.com'}</p>
            <div className="mt-4 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              Free Plan
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${activeSection === 'profile' ? 'bg-[var(--color-background)] text-[var(--color-accent)] border border-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]'}`}>
              <User className="w-4 h-4 mr-3" /> Profile Details
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('security')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${activeSection === 'security' ? 'bg-[var(--color-background)] text-[var(--color-accent)] border border-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]'}`}>
              <Lock className="w-4 h-4 mr-3" /> Security
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('privacy')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${activeSection === 'privacy' ? 'bg-[var(--color-background)] text-[var(--color-accent)] border border-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)]'}`}>
              <Shield className="w-4 h-4 mr-3" /> Data & Privacy
            </button>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2">
          {activeSection === 'profile' ? (
            <div className="space-y-8">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 border-b border-[var(--color-border)] pb-4">Personal Information</h3>

                {profileMessage && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start ${profileMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {profileMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${profileMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{profileMessage.text}</p>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-[var(--color-muted)]" />
                        </div>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-[var(--color-muted)]" />
                        </div>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-muted)] focus:outline-none cursor-not-allowed text-sm"
                        />
                      </div>
                      <p className="text-xs text-[var(--color-muted)] mt-1.5">Email cannot be changed.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                    <p className="font-medium text-[var(--color-foreground)]">Theme preference</p>
                    <p className="text-sm text-[var(--color-muted)]">Choose how your profile page appears in this browser.</p>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {['system', 'light', 'dark'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setThemeMode(mode as 'system' | 'light' | 'dark')}
                          className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${themeMode === mode ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-foreground)]' : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted)]'}`}
                        >
                          {mode === 'system' ? 'System' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="flex items-center px-6 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                      {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : activeSection === 'security' ? (
            <div className="space-y-8">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 border-b border-[var(--color-border)] pb-4">Security</h3>
                <p className="text-sm text-[var(--color-muted)] mb-6">Update your password and review recent account access details.</p>

                {passwordMessage && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start ${passwordMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{passwordMessage.text}</p>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Current Password</label>
                    <div className="relative max-w-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[var(--color-muted)]" />
                      </div>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">New Password</label>
                    <div className="relative max-w-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[var(--color-muted)]" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <p className="text-xs text-[var(--color-muted)] mt-1.5">Must be at least 6 characters.</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="flex items-center px-6 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                      {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
                <h4 className="text-md font-semibold text-[var(--color-foreground)] mb-3">Account access</h4>
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                    <p className="text-sm font-medium text-[var(--color-foreground)]">Two-Factor Authentication</p>
                    <p className="text-sm text-[var(--color-muted)]">Protect your account by enabling 2FA. This is not yet configured in this demo.</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                    <p className="text-sm font-medium text-[var(--color-foreground)]">Recent sign-ins</p>
                    <p className="text-sm text-[var(--color-muted)]">Last login from Chrome on Windows, 2 hours ago.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 border-b border-[var(--color-border)] pb-4">Data & Privacy</h3>
                <p className="text-sm text-[var(--color-muted)] mb-6">Choose how your data is used, manage export access, and control privacy settings.</p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
                    <div>
                      <p className="font-medium text-[var(--color-foreground)]">Email notifications</p>
                      <p className="text-sm text-[var(--color-muted)]">Receive alerts for new analysis results and product updates.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-5 w-5 accent-[var(--color-accent)]"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
                    <div>
                      <p className="font-medium text-[var(--color-foreground)]">Product updates</p>
                      <p className="text-sm text-[var(--color-muted)]">Allow us to send feature announcements and roadmap news.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={productUpdates}
                      onChange={(e) => setProductUpdates(e.target.checked)}
                      className="h-5 w-5 accent-[var(--color-accent)]"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
                    <div>
                      <p className="font-medium text-[var(--color-foreground)]">Analytics tracking</p>
                      <p className="text-sm text-[var(--color-muted)]">Allow anonymous usage tracking to improve recommendations.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!analyticsOptOut}
                      onChange={(e) => setAnalyticsOptOut(!e.target.checked)}
                      className="h-5 w-5 accent-[var(--color-accent)]"
                    />
                  </label>
                </div>

                <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <p className="font-medium text-[var(--color-foreground)]">Data access</p>
                  <p className="text-sm text-[var(--color-muted)]">You can request a copy of your stored information or remove it from the system.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface)] transition">
                      Request data export
                    </button>
                    <button type="button" className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 transition">
                      Delete my data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
