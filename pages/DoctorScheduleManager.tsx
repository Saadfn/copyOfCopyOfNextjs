
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, AlertCircle, User, Building2, ChevronRight, Save, CheckCircle2, XCircle } from 'lucide-react';
import { db, KEYS } from '../utils/storage';
import { DoctorProfile, DoctorWeeklySchedule, DoctorScheduleOverride, OverrideStatus } from '../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorScheduleManager = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [weeklySchedules, setWeeklySchedules] = useState<DoctorWeeklySchedule[]>([]);
  const [overrides, setOverrides] = useState<DoctorScheduleOverride[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const docs = db.getTable<DoctorProfile>(KEYS.DOCTORS);
    const users = db.getTable<any>(KEYS.USERS);
    const enriched = docs.map(d => ({
      ...d,
      user: users.find((u: any) => u.id === d.userId)
    }));
    setDoctors(enriched);
    
    if (enriched.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(enriched[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      const allSchedules = db.getTable<DoctorWeeklySchedule>(KEYS.DOCTOR_SCHEDULES);
      const doctorSchedules = allSchedules.filter(s => s.doctorId === selectedDoctorId);
      
      // Ensure all days are represented
      const completeSchedules = DAYS.map((_, index) => {
        const existing = doctorSchedules.find(s => s.dayOfWeek === index);
        return existing || {
          id: `tmp_${index}_${Date.now()}`,
          doctorId: selectedDoctorId,
          dayOfWeek: index,
          startTime: '09:00',
          endTime: '17:00',
          isActive: false
        };
      });
      
      setWeeklySchedules(completeSchedules);
      
      const allOverrides = db.getTable<DoctorScheduleOverride>(KEYS.DOCTOR_OVERRIDES);
      setOverrides(allOverrides.filter(o => o.doctorId === selectedDoctorId));
    }
  }, [selectedDoctorId]);

  const handleToggleDay = (index: number) => {
    setWeeklySchedules(prev => prev.map((s, i) => i === index ? { ...s, isActive: !s.isActive } : s));
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedules(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSaveSchedules = () => {
    const allSchedules = db.getTable<DoctorWeeklySchedule>(KEYS.DOCTOR_SCHEDULES);
    const otherDocsSchedules = allSchedules.filter(s => s.doctorId !== selectedDoctorId);
    
    // Clean up IDs for temporary ones
    const updatedSchedules = weeklySchedules.map(s => ({
      ...s,
      id: s.id.startsWith('tmp_') ? `ds_${selectedDoctorId}_${s.dayOfWeek}` : s.id
    }));

    localStorage.setItem(KEYS.DOCTOR_SCHEDULES, JSON.stringify([...otherDocsSchedules, ...updatedSchedules]));
    setIsEditing(false);
    alert("Weekly schedule updated successfully.");
  };

  const handleOverrideStatus = (overrideId: string, status: OverrideStatus) => {
    const allOverrides = db.getTable<DoctorScheduleOverride>(KEYS.DOCTOR_OVERRIDES);
    const updated = allOverrides.map(o => o.id === overrideId ? { ...o, status } : o);
    localStorage.setItem(KEYS.DOCTOR_OVERRIDES, JSON.stringify(updated));
    setOverrides(updated.filter(o => o.doctorId === selectedDoctorId));
  };

  const selectedDoc = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-600" /> Physician Schedule Manager
          </h1>
          <p className="text-slate-500 text-sm">Configure availability and manage time-off requests for specialists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Doctor Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Physician</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {doctors.map(doc => (
              <button
                key={doc.id}
                onClick={() => { setSelectedDoctorId(doc.id); setIsEditing(false); }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedDoctorId === doc.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                <p className="font-bold text-sm leading-tight">{doc.user?.name}</p>
                <p className={`text-[10px] font-bold uppercase mt-1 ${selectedDoctorId === doc.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {doc.specialization}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Schedule Area */}
        <div className="lg:col-span-3 space-y-8">
          {selectedDoc && (
            <>
              {/* Weekly Schedule Section */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Standard Weekly Schedule</h3>
                      <p className="text-sm text-slate-500 font-medium">Define recurring available hours per day.</p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all"
                    >
                      Modify Schedule
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleSaveSchedules}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {weeklySchedules.map((day, idx) => (
                    <div key={day.id || idx} className={`flex items-center gap-6 p-4 rounded-2xl border transition-all ${day.isActive ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/30 border-dashed border-slate-200 opacity-60'}`}>
                      <div className="w-32">
                        <span className="text-sm font-bold text-slate-900">{DAYS[idx]}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-4">
                        {isEditing ? (
                          <>
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" checked={day.isActive} onChange={() => handleToggleDay(idx)}
                                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{day.isActive ? 'Active' : 'Off'}</span>
                            </div>
                            {day.isActive && (
                              <div className="flex items-center gap-3 ml-4 animate-in slide-in-from-left-2">
                                <input 
                                  type="time" value={day.startTime} onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-600"
                                />
                                <span className="text-slate-400 text-sm font-bold">to</span>
                                <input 
                                  type="time" value={day.endTime} onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-600"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${day.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                              {day.isActive ? 'Active' : 'Unavailable'}
                            </span>
                            {day.isActive && (
                              <span className="text-sm font-bold text-slate-700">{day.startTime} - {day.endTime}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overrides / Requests Section */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Schedule Overrides & Requests</h3>
                    <p className="text-sm text-slate-500 font-medium">Review time-off requests and one-time shift changes.</p>
                  </div>
                </div>

                {overrides.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No pending requests or overrides for this physician.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {overrides.map(ov => (
                      <div key={ov.id} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className="text-center w-16">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ov.date.split('-')[0]}</p>
                            <p className="text-lg font-bold text-slate-900">{ov.date.split('-')[2]}</p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{new Date(ov.date).toLocaleString('default', { month: 'short' })}</p>
                          </div>
                          <div className="h-10 w-px bg-slate-100"></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ov.type === 'LEAVE' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                {ov.type.replace('_', ' ')}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                ov.status === OverrideStatus.APPROVED ? 'text-emerald-500' : 
                                ov.status === OverrideStatus.DECLINED ? 'text-rose-500' : 'text-amber-500'
                              }`}>
                                • {ov.status}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 mt-1">{ov.reason}</p>
                            {ov.type === 'SHIFT_CHANGE' && (
                              <p className="text-xs text-slate-500 font-medium mt-1">New Hours: {ov.startTime} - {ov.endTime}</p>
                            )}
                          </div>
                        </div>

                        {ov.status === OverrideStatus.PENDING && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOverrideStatus(ov.id, OverrideStatus.DECLINED)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <XCircle size={24} />
                            </button>
                            <button 
                              onClick={() => handleOverrideStatus(ov.id, OverrideStatus.APPROVED)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            >
                              <CheckCircle2 size={24} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleManager;
