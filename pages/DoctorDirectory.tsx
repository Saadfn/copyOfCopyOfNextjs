
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Stethoscope, Search, MapPin, Clock, Timer, DollarSign, ChevronRight, Filter } from 'lucide-react';
import { db, KEYS } from '../utils/storage';
import { DoctorProfile, DoctorWeeklySchedule, Branch } from '../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [schedules, setSchedules] = useState<DoctorWeeklySchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  useEffect(() => {
    db.init();
    const docs = db.getTable<DoctorProfile>(KEYS.DOCTORS);
    const users = db.getTable<any>(KEYS.USERS);
    const enriched = docs.map(d => ({
      ...d,
      user: users.find((u: any) => u.id === d.userId)
    }));
    
    setDoctors(enriched);
    setBranches(db.getTable<Branch>(KEYS.BRANCHES));
    setSchedules(db.getTable<DoctorWeeklySchedule>(KEYS.DOCTOR_SCHEDULES));
  }, []);

  const specializations = ['All', ...Array.from(new Set(doctors.map(d => d.specialization)))];
  const filtered = doctors.filter(d => (d.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialization.toLowerCase().includes(searchTerm.toLowerCase())) && (selectedSpecialization === 'All' || d.specialization === selectedSpecialization));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Stethoscope className="text-blue-600" /> Specialist Directory</h1>
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name or specialty..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none" />
        </div>
        <select value={selectedSpecialization} onChange={(e) => setSelectedSpecialization(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none w-full md:w-48">
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:border-blue-300 transition-all flex flex-col">
            <div className="flex items-start gap-5 mb-6">
              <img src={`https://picsum.photos/seed/${doctor.id}/80/80`} className="w-20 h-20 rounded-2xl border border-slate-200 shadow-sm" alt="" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{doctor.user?.name}</h3>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">{doctor.specialization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-500" />
                <div><p className="text-[8px] font-bold text-slate-400 uppercase">Fee</p><p className="text-xs font-bold text-slate-900">${doctor.consultationFee}</p></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-2">
                <Timer size={14} className="text-blue-500" />
                <div><p className="text-[8px] font-bold text-slate-400 uppercase">Slot</p><p className="text-xs font-bold text-slate-900">{doctor.slotDuration}m</p></div>
              </div>
            </div>
            <Link href="/book-appointment" className="w-full text-center py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all mt-auto">Schedule Appointment</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorDirectory;
