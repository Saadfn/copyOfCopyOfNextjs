
'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Menu, UserCheck, LogOut } from 'lucide-react';
import { User } from '../types';
import { db } from '../utils/storage';

export const Navbar = ({ user }: { user: User }) => (
  <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
    <div className="flex items-center gap-4">
      <button className="lg:hidden text-slate-600">
        <Menu size={24} />
      </button>
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search hospital data..." 
          className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name || 'User'}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
        </div>
        <div className="relative group cursor-pointer">
          <img 
            src={`https://picsum.photos/seed/${user.id}/40/40`} 
            alt="User" 
            className="w-10 h-10 rounded-full border border-slate-200 hover:border-blue-500 transition-all" 
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
            <Link href="/profile" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-50 rounded-lg transition-colors">
              <UserCheck size={16} /> My Profile
            </Link>
            <button 
              onClick={() => db.logout()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 font-semibold hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
);
