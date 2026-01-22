
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Send, History, CheckCircle2, XCircle, Clock4 } from 'lucide-react';
import { db, KEYS } from '../utils/storage';
import { DoctorProfile, DoctorScheduleOverride, OverrideStatus } from '../types';

const DoctorOverrideRequest = () => {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [myOverrides, setMyOverrides] = useState<DoctorScheduleOverride[]>([]);
  
  const [formData, setFormData] = useState({
    date: '',
    type: 'LEAVE' as 'LEAVE' | 'SHIFT_CHANGE',
    startTime: '09:00',
    endTime: '17:00',
    reason: ''
  });

  useEffect(() => {
    db.init();
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    if (!currentUser) return;

    const docs = db.getTable<DoctorProfile>(KEYS.DOCTORS);
    const profile = docs.find(d => d.userId === currentUser.id);
    setDoctorProfile(profile || null);
    
    if (profile) {
      const allOverrides = db.getTable<DoctorScheduleOverride>(KEYS.DOCTOR_OVERRIDES);
      setMyOverrides(allOverrides.filter(o => o.doctorId === profile.id));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorProfile) return;

    const newOverride: DoctorScheduleOverride = {
      id: `ov_${Date.now()}`,
      doctorId: doctorProfile.id,
      ...formData,
      status: OverrideStatus.PENDING
    };

    const updated = db.saveToTable(KEYS.DOCTOR_OVERRIDES, newOverride);
    setMyOverrides(updated.filter(o => o.doctorId === doctorProfile.id));
    alert("Request submitted for admin approval.");
    setFormData({ date: '', type: 'LEAVE', startTime: '09:00', endTime: '17:00', reason: '' });
  };

  const getStatusIcon = (status: OverrideStatus) => {
    switch (status) {
      case OverrideStatus.APPROVED: return <CheckCircle2 className="text-emerald-500" size={16} />;
      case OverrideStatus.DECLINED: return <XCircle className="text-rose-500" size={16} />;
      default: return <Clock4 className="text-amber-500" size={16} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Request Time Off</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your availability and special shifts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <input required type="date" value={formData.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
          <div className="flex gap-4">
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'LEAVE' }))} className={`flex-1 py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${formData.type === 'LEAVE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'}`}>Full Day Leave</button>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'SHIFT_CHANGE' }))} className={`flex-1 py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${formData.type === 'SHIFT_CHANGE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'}`}>Shift Change</button>
          </div>
          {formData.type === 'SHIFT_CHANGE' && (
            <div className="grid grid-cols-2 gap-4">
              <input type="time" value={formData.startTime} onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold" />
              <input type="time" value={formData.endTime} onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold" />
            </div>
          )}
          <textarea required placeholder="Reason for request" value={formData.reason} onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm h-32 resize-none outline-none" />
          <button type="submit" className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold shadow-xl hover:bg-blue-700 transition-all">Submit Request</button>
        </form>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><History size={18} /> Request History</h3>
          <div className="space-y-3">
            {myOverrides.map(ov => (
              <div key={ov.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{ov.date}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ov.type}</p>
                </div>
                {getStatusIcon(ov.status)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverrideRequest;
