
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Search, Plus, Filter, Download, 
  ChevronRight, MoreVertical, CheckCircle2, XCircle, Clock4, AlertCircle, Loader2 
} from 'lucide-react';
import { api } from '../services/api';
import { Appointment, UserRole, AppointmentStatus } from '../types';
import { exportToCSV } from '../utils/csvExport';

const AppointmentList = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      const data = await api.getAppointments(user?.role, user?.id);
      setAppointments(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: AppointmentStatus) => {
    await api.updateAppointmentStatus(appId, newStatus);
    setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
  };

  const handleExport = () => {
    exportToCSV(appointments, 'StGeorge_Appointments');
  };

  const filtered = appointments.filter(a => {
    const patientName = a.patient?.user?.name || '';
    const doctorName = a.doctor?.user?.name || '';
    const matchesSearch = a.appointmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case AppointmentStatus.PENDING: return 'bg-amber-50 text-amber-600 border-amber-100';
      case AppointmentStatus.CANCELLED: return 'bg-rose-50 text-rose-600 border-rose-100';
      case AppointmentStatus.COMPLETED: return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentUser?.role === UserRole.ADMIN ? 'Global Appointments' : 'My Appointments'}
          </h1>
          <p className="text-slate-500 text-sm">
            {currentUser?.role === UserRole.ADMIN 
              ? 'Comprehensive view of all hospital schedules and requests.' 
              : 'Keep track of your medical visits and follow-ups.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all">
            <Download size={18} /> Export
          </button>
          {currentUser?.role === UserRole.PATIENT && (
            <Link href="/book-appointment" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2">
              <Plus size={18} /> Request Appointment
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Search by ID, Patient or Doctor..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <select 
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none"
        >
          <option value="ALL">All Status</option>
          {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="h-[400px] w-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          currentUser?.role === UserRole.ADMIN ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">ID / Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status Update</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-blue-600 font-mono">{app.appointmentNo}</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{new Date(app.dateTime).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{app.patient?.user?.name || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700">{app.doctor?.user?.name || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value as AppointmentStatus)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none ${getStatusStyle(app.status)}`}
                          >
                            {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                      {app.status}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 font-mono">{app.appointmentNo}</p>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{app.doctor?.user?.name || 'Specialist'}</h4>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1 mb-6">{app.doctor?.specialization}</p>
                  <div className="space-y-3 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <CalendarIcon size={16} className="text-slate-400" />
                      {new Date(app.dateTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      {app.startTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
