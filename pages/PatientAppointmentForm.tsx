
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, MapPin, Stethoscope, ChevronRight, X, ClipboardCheck, Info, CheckCircle2, DollarSign, Timer, CreditCard } from 'lucide-react';
import { db, KEYS } from '../utils/storage';
import { Branch, DoctorProfile, Appointment, AppointmentStatus, PatientProfile, DoctorWeeklySchedule, DoctorScheduleOverride, OverrideStatus } from '../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PatientAppointmentForm = () => {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorWeeklySchedule[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const [formData, setFormData] = useState({
    branchId: '',
    doctorId: '',
    date: '',
    startTime: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    db.init();
    const user = db.getCurrentUser();
    if (!user) return;
    
    const profiles = db.getTable<PatientProfile>(KEYS.PATIENTS);
    const profile = profiles.find(p => p.userId === user.id);
    setPatientProfile(profile || null);

    setBranches(db.getTable<Branch>(KEYS.BRANCHES));
    
    const allDocs = db.getTable<DoctorProfile>(KEYS.DOCTORS);
    const allUsers = db.getTable<any>(KEYS.USERS);
    setDoctors(allDocs.map(d => ({ ...d, user: allUsers.find((u: any) => u.id === d.userId) })));
  }, []);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      calculateSlots();
    }
  }, [formData.doctorId, formData.date]);

  const calculateSlots = () => {
    setIsCalculating(true);
    const dateObj = new Date(formData.date);
    const dayOfWeek = dateObj.getDay();
    const selectedDoc = doctors.find(d => d.id === formData.doctorId);
    const slotDuration = selectedDoc?.slotDuration || 30;

    const weeklySchedules = db.getTable<DoctorWeeklySchedule>(KEYS.DOCTOR_SCHEDULES);
    const baseSched = weeklySchedules.find(s => s.doctorId === formData.doctorId && s.dayOfWeek === dayOfWeek && s.isActive);
    
    if (!baseSched) {
      setAvailableSlots([]);
      setIsCalculating(false);
      return;
    }

    const overrides = db.getTable<DoctorScheduleOverride>(KEYS.DOCTOR_OVERRIDES);
    const activeOverride = overrides.find(o => o.doctorId === formData.doctorId && o.date === formData.date && o.status === OverrideStatus.APPROVED);

    if (activeOverride?.type === 'LEAVE') {
      setAvailableSlots([]);
      setIsCalculating(false);
      return;
    }

    const start = activeOverride?.startTime || baseSched.startTime;
    const end = activeOverride?.endTime || baseSched.endTime;
    const slots: string[] = [];
    let current = new Date(`2000-01-01T${start}`);
    const final = new Date(`2000-01-01T${end}`);

    while (current < final) {
      slots.push(current.toTimeString().substring(0, 5));
      current.setMinutes(current.getMinutes() + slotDuration);
    }

    const allApps = db.getTable<Appointment>(KEYS.APPOINTMENTS);
    const occupied = allApps.filter(a => a.doctorId === formData.doctorId && a.appointmentDate === formData.date && a.status !== AppointmentStatus.CANCELLED).map(a => a.startTime);

    setAvailableSlots(slots.filter(s => !occupied.includes(s)));
    setIsCalculating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientProfile || !formData.startTime) return;
    const selectedDoc = doctors.find(d => d.id === formData.doctorId);
    const duration = selectedDoc?.slotDuration || 30;

    const [h, m] = formData.startTime.split(':');
    const end = new Date(2000, 0, 1, parseInt(h), parseInt(m) + duration);

    const newAppointment: Appointment = {
      id: `app_${Date.now()}`,
      appointmentNo: `APP-${Math.floor(Math.random() * 90000) + 10000}`,
      patientId: patientProfile.id,
      branchId: formData.branchId,
      doctorId: formData.doctorId,
      appointmentDate: formData.date,
      startTime: formData.startTime,
      endTime: end.toTimeString().substring(0, 5),
      dateTime: `${formData.date}T${formData.startTime}:00`,
      duration: duration,
      status: AppointmentStatus.PENDING,
      reason: formData.reason,
      type: 'Consultation',
      notes: formData.notes,
      reminderSent: false,
      createdAt: new Date().toISOString()
    };

    db.saveToTable(KEYS.APPOINTMENTS, newAppointment);
    alert("Appointment request submitted successfully!");
    router.push('/appointments');
  };

  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <CalendarIcon className="text-blue-600" /> Book an Appointment
        </h1>
        <button onClick={() => router.back()} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                required value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value, doctorId: '', startTime: '' }))}
                className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none"
              >
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select
                required disabled={!formData.branchId} value={formData.doctorId}
                onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value, startTime: '' }))}
                className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-blue-600 outline-none disabled:opacity-50"
              >
                <option value="">Select Doctor</option>
                {doctors.filter(d => !formData.branchId || d.branchId === formData.branchId).map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.user?.name} - {doc.specialization}</option>
                ))}
              </select>
            </div>
            <input 
              required disabled={!formData.doctorId} type="date" value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value, startTime: '' }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold outline-none"
            />
            {formData.date && availableSlots.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot} type="button" onClick={() => setFormData(prev => ({ ...prev, startTime: slot }))}
                    className={`py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all ${
                      formData.startTime === slot ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            <input
              required placeholder="Reason for visit" value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none"
            />
            <button
              type="submit" disabled={!formData.startTime}
              className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              Confirm Appointment Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientAppointmentForm;
