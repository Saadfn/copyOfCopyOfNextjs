
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar, Pill, Receipt, Settings, 
  Stethoscope, ShieldCheck, Database, LogOut, Building2, 
  FlaskConical, Bed, Package, Plus, Clock, UserCheck 
} from 'lucide-react';
import { User, UserRole } from '../types';
import { db } from '../utils/storage';

const SidebarItem = ({ 
  icon: Icon, label, path, active, isIncomplete 
}: { 
  icon: any, label: string, path: string, active: boolean, isIncomplete: boolean 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isIncomplete && path !== '/profile') {
      e.preventDefault();
      alert("Please complete your profile first to access this feature.");
    }
  };

  return (
    <Link 
      href={isIncomplete ? '/profile' : path}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const Sidebar = ({ user }: { user: User }) => {
  const pathname = usePathname();
  const isPatient = user.role === UserRole.PATIENT;
  const isIncomplete = isPatient && !user.isProfileComplete;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <Stethoscope size={24} />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">St. George</span>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2">Main Menu</p>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" active={pathname === '/'} isIncomplete={isIncomplete} />
        
        {(!isPatient) && (
          <SidebarItem icon={Users} label="Patients" path="/patients" active={pathname.startsWith('/patients')} isIncomplete={false} />
        )}
        
        <SidebarItem icon={Calendar} label="Appointments" path="/appointments" active={pathname === '/appointments'} isIncomplete={isIncomplete} />
        
        {isPatient && (
          <>
            <SidebarItem icon={Stethoscope} label="Find Doctors" path="/doctor-directory" active={pathname === '/doctor-directory'} isIncomplete={isIncomplete} />
            <SidebarItem icon={Plus} label="Book Slot" path="/book-appointment" active={pathname === '/book-appointment'} isIncomplete={isIncomplete} />
            <SidebarItem icon={FlaskConical} label="Lab Tests" path="/my-labs" active={pathname === '/my-labs'} isIncomplete={isIncomplete} />
          </>
        )}

        {user.role === UserRole.DOCTOR && (
          <SidebarItem icon={Clock} label="My Availability" path="/my-availability" active={pathname === '/my-availability'} isIncomplete={false} />
        )}
        
        {!isPatient && (
          <>
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">Operations</p>
            {user.role === UserRole.ADMIN && (
              <SidebarItem icon={Clock} label="Physician Sched" path="/doctor-schedules" active={pathname === '/doctor-schedules'} isIncomplete={false} />
            )}
            <SidebarItem icon={Package} label="Branch Stock" path="/inventory" active={pathname === '/inventory'} isIncomplete={false} />
            {(user.role === UserRole.ADMIN || user.role === UserRole.STAFF) && (
              <SidebarItem icon={Receipt} label="Billing" path="/billing" active={pathname === '/billing'} isIncomplete={false} />
            )}
            
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">Resources</p>
            <SidebarItem icon={Pill} label="Medicine Catalog" path="/medicine-catalog" active={pathname === '/medicine-catalog'} isIncomplete={false} />
            <SidebarItem icon={FlaskConical} label="Admin Lab Tests" path="/lab-tests" active={pathname === '/lab-tests'} isIncomplete={false} />
            <SidebarItem icon={Bed} label="Rooms" path="/rooms" active={pathname === '/rooms'} isIncomplete={false} />
            
            {user.role === UserRole.ADMIN && (
              <>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">System Admin</p>
                <SidebarItem icon={Building2} label="Branches" path="/branches" active={pathname === '/branches'} isIncomplete={false} />
                <SidebarItem icon={ShieldCheck} label="Users" path="/users" active={pathname === '/users'} isIncomplete={false} />
                <SidebarItem icon={Database} label="Mock Database" path="/database" active={pathname === '/database'} isIncomplete={false} />
              </>
            )}
          </>
        )}
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">General</p>
        <SidebarItem icon={Settings} label="Settings" path="/settings" active={pathname === '/settings'} isIncomplete={isIncomplete} />
      </nav>

      <div className="p-4 border-t border-slate-100">
         <button 
            onClick={() => db.logout()}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} /> Logout
          </button>
      </div>
    </aside>
  );
};
