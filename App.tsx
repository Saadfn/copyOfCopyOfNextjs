
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Pill, 
  Receipt, 
  Bell, 
  Settings,
  Search,
  Menu,
  Stethoscope,
  ShieldCheck,
  Database,
  LogOut,
  Building2,
  FlaskConical,
  Bed,
  Package,
  Plus,
  Clock,
  UserCheck
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import AppointmentList from './pages/AppointmentList';
import PatientAppointmentForm from './pages/PatientAppointmentForm';
import InventoryManagement from './pages/InventoryManagement';
import BillingList from './pages/BillingList';
import MedicalRecordsList from './pages/MedicalRecordsList';
import UserManagement from './pages/UserManagement';
import DatabaseManager from './pages/DatabaseManager';
import BranchManagement from './pages/BranchManagement';
import MedicineManagement from './pages/MedicineManagement';
import LabManagement from './pages/LabManagement';
import RoomManagement from './pages/RoomManagement';
import DoctorScheduleManager from './pages/DoctorScheduleManager';
import DoctorOverrideRequest from './pages/DoctorOverrideRequest';
import PatientProfilePage from './pages/PatientProfilePage';
import PatientLabTests from './pages/PatientLabTests';
import DoctorDirectory from './pages/DoctorDirectory';
import Login from './pages/Login';
import { db } from './utils/storage';
import { User, UserRole } from './types';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  path, 
  active, 
  isIncomplete, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  path: string, 
  active: boolean, 
  isIncomplete: boolean,
  onClick?: () => void
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isIncomplete && path !== '/profile') {
      e.preventDefault();
      alert("Please complete your profile first to access this feature.");
      return;
    }
    if (onClick) onClick();
  };

  return (
    <Link 
      to={isIncomplete ? '/profile' : path}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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

const Navbar = ({ user }: { user: User | null }) => (
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
          <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name || 'User'}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Guest'}</p>
        </div>
        <div className="relative group cursor-pointer">
          <img 
            src={`https://picsum.photos/seed/${user?.id}/40/40`} 
            alt="User" 
            className="w-10 h-10 rounded-full border border-slate-200 hover:border-blue-500 transition-all" 
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
            <Link to="/profile" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-50 rounded-lg transition-colors">
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

const Layout = ({ children, user }: { children?: React.ReactNode, user: User | null }) => {
  const location = useLocation();
  const isPatient = user?.role === UserRole.PATIENT;
  const isIncomplete = isPatient && !user?.isProfileComplete;
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">St. George</span>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2">Main Menu</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" active={location.pathname === '/'} isIncomplete={isIncomplete} />
          
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.DOCTOR || user?.role === UserRole.STAFF) && (
            <SidebarItem icon={Users} label="Patients" path="/patients" active={location.pathname.startsWith('/patients')} isIncomplete={false} />
          )}
          
          <SidebarItem icon={Calendar} label="Appointments" path="/appointments" active={location.pathname === '/appointments'} isIncomplete={isIncomplete} />
          
          {isPatient && (
             <>
               <SidebarItem icon={Stethoscope} label="Find Doctors" path="/doctor-directory" active={location.pathname === '/doctor-directory'} isIncomplete={isIncomplete} />
               <SidebarItem icon={Plus} label="Book Slot" path="/book-appointment" active={location.pathname === '/book-appointment'} isIncomplete={isIncomplete} />
               <SidebarItem icon={FlaskConical} label="Lab Tests" path="/my-labs" active={location.pathname === '/my-labs'} isIncomplete={isIncomplete} />
             </>
          )}

          {user?.role === UserRole.DOCTOR && (
             <SidebarItem icon={Clock} label="My Availability" path="/my-availability" active={location.pathname === '/my-availability'} isIncomplete={false} />
          )}
          
          {!isPatient && (
            <>
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">Operations</p>
              
              {user?.role === UserRole.ADMIN && (
                <SidebarItem icon={Clock} label="Physician Sched" path="/doctor-schedules" active={location.pathname === '/doctor-schedules'} isIncomplete={false} />
              )}

              <SidebarItem icon={Package} label="Branch Stock" path="/inventory" active={location.pathname === '/inventory'} isIncomplete={false} />
              
              {(user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF) && (
                <SidebarItem icon={Receipt} label="Billing" path="/billing" active={location.pathname === '/billing'} isIncomplete={false} />
              )}
              
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">Resources</p>
              <SidebarItem icon={Pill} label="Medicine Catalog" path="/medicine-catalog" active={location.pathname === '/medicine-catalog'} isIncomplete={false} />
              <SidebarItem icon={FlaskConical} label="Admin Lab Tests" path="/lab-tests" active={location.pathname === '/lab-tests'} isIncomplete={false} />
              <SidebarItem icon={Bed} label="Rooms" path="/rooms" active={location.pathname === '/rooms'} isIncomplete={false} />
              
              {user?.role === UserRole.ADMIN && (
                <>
                  <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">System Admin</p>
                  <SidebarItem icon={Building2} label="Branches" path="/branches" active={location.pathname === '/branches'} isIncomplete={false} />
                  <SidebarItem icon={ShieldCheck} label="Users" path="/users" active={location.pathname === '/users'} isIncomplete={false} />
                  <SidebarItem icon={Database} label="Mock Database" path="/database" active={location.pathname === '/database'} isIncomplete={false} />
                </>
              )}
            </>
          )}
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">General</p>
          <SidebarItem icon={Settings} label="Settings" path="/settings" active={location.pathname === '/settings'} isIncomplete={isIncomplete} />
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(db.getCurrentUser());

  useEffect(() => {
    db.init();
    setUser(db.getCurrentUser());
  }, []);

  const handleLoginSuccess = () => {
    setUser(db.getCurrentUser());
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isProfileIncomplete = user.role === UserRole.PATIENT && user.isProfileComplete === false;

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/profile" element={<PatientProfilePage onComplete={handleLoginSuccess} />} />
          
          {isProfileIncomplete ? (
            <Route path="*" element={<Navigate to="/profile" replace />} />
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/appointments" element={<AppointmentList />} />
              <Route path="/doctor-directory" element={<DoctorDirectory />} />
              <Route path="/book-appointment" element={user.role === UserRole.PATIENT ? <PatientAppointmentForm /> : <Navigate to="/appointments" replace />} />
              <Route path="/my-labs" element={user.role === UserRole.PATIENT ? <PatientLabTests /> : <Navigate to="/" replace />} />
              <Route path="/doctor-schedules" element={user.role === UserRole.ADMIN ? <DoctorScheduleManager /> : <Navigate to="/" replace />} />
              <Route path="/my-availability" element={user.role === UserRole.DOCTOR ? <DoctorOverrideRequest /> : <Navigate to="/" replace />} />
              <Route path="/records" element={<MedicalRecordsList />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/billing" element={<BillingList />} />
              <Route path="/medicine-catalog" element={<MedicineManagement />} />
              <Route path="/lab-tests" element={<LabManagement />} />
              <Route path="/rooms" element={<RoomManagement />} />
              <Route path="/users" element={user.role === UserRole.ADMIN ? <UserManagement /> : <Navigate to="/" replace />} />
              <Route path="/branches" element={user.role === UserRole.ADMIN ? <BranchManagement /> : <Navigate to="/" replace />} />
              <Route path="/database" element={user.role === UserRole.ADMIN ? <DatabaseManager /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Layout>
    </Router>
  );
}
