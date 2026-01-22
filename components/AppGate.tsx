
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '../utils/storage';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import Login from '../pages/Login';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export default function AppGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const currentUser = await api.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    db.init();
    refreshUser().then(() => setIsReady(true));
  }, [refreshUser]);

  const handleLoginSuccess = async () => {
    await refreshUser();
  };

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">St. George Portal</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isProfileIncomplete = user.role === UserRole.PATIENT && !user.isProfileComplete;

  // Enforce profile completion redirect
  if (isProfileIncomplete && pathname !== '/profile') {
    router.replace('/profile');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
          {/* We pass a refresh function if needed by children, though usually unnecessary */}
          {children}
        </main>
      </div>
    </div>
  );
}
