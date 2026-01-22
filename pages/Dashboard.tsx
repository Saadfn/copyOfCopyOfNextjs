
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Calendar, Pill, TrendingUp, AlertCircle, Clock, Activity, FlaskConical, Stethoscope, Plus, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { UserRole, Appointment, MedicalRecord, PatientProfile, User } from '../types';

const revenueData = [
  { name: 'Mon', patients: 40, revenue: 2400 },
  { name: 'Tue', patients: 30, revenue: 1398 },
  { name: 'Wed', patients: 20, revenue: 9800 },
  { name: 'Thu', patients: 27, revenue: 3908 },
  { name: 'Fri', patients: 18, revenue: 4800 },
  { name: 'Sat', patients: 23, revenue: 3800 },
  { name: 'Sun', patients: 34, revenue: 4300 },
];

const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string, value: string, icon: any, trend?: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-green-500 text-sm font-medium flex items-center gap-1">
          <TrendingUp size={16} /> {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<{
    appointments: Appointment[];
    stats: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      
      const isPatient = currentUser?.role === UserRole.PATIENT;
      const apps = await api.getAppointments(currentUser?.role, currentUser?.id);
      
      // Basic stats logic moved to component or could be another API call
      let stats = {};
      if (isPatient) {
        stats = {
          upcoming: apps.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length,
          totalVisits: 0, // In real scenario, fetch record count
          activeLabs: 0,
          waitingTime: 'N/A'
        };
      } else {
        const patients = await api.getPatients();
        stats = {
          totalPatients: patients.length,
          appointmentsToday: apps.length,
          medicineStock: 452,
          waitingTime: '18m'
        };
      }

      setData({ appointments: apps, stats });
      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  const isPatient = user?.role === UserRole.PATIENT;

  if (isPatient) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name}</h1>
            <p className="text-slate-500">Here's a summary of your health profile and upcoming medical activities.</p>
          </div>
          <Link href="/book-appointment" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
            <Plus size={18} /> Book Appointment
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Upcoming Sessions" value={data?.stats.upcoming.toString()} icon={Calendar} color="bg-blue-500" />
          <StatCard title="Total Consultations" value={data?.stats.totalVisits.toString()} icon={Activity} color="bg-emerald-500" />
          <StatCard title="Active Lab Tests" value="2" icon={FlaskConical} color="bg-amber-500" />
          <StatCard title="Health Score" value="94%" icon={TrendingUp} color="bg-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Your Recent Appointments</h3>
                <Link href="/appointments" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Specialist</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.appointments.slice(0, 3).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <Stethoscope size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">Specialist</p>
                              <p className="text-xs text-slate-500">ID: {app.doctorId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 font-medium">{new Date(app.dateTime).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-400">{app.startTime}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            app.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data?.appointments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No appointments booked yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <AlertCircle className="text-blue-500" /> Reminders
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="p-2 bg-blue-500 text-white rounded-lg h-fit">
                    <Pill size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Medication Due</p>
                    <p className="text-xs text-slate-600 mt-1">Check prescription list</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-slate-500">Welcome to St. George Hospital portal. Here's what's happening across our facilities today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={data?.stats.totalPatients?.toString() || '0'} icon={Users} trend="+12%" color="bg-blue-500" />
        <StatCard title="Appointments" value={data?.stats.appointmentsToday?.toString() || '0'} icon={Calendar} trend="+5%" color="bg-emerald-500" />
        <StatCard title="Medicine Stock" value={data?.stats.medicineStock?.toString() || '0'} icon={Pill} trend="-2%" color="bg-amber-500" />
        <StatCard title="Avg. Waiting Time" value={data?.stats.waitingTime || '0m'} icon={Clock} trend="-4%" color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Patient Admissions</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Analysis ($)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
