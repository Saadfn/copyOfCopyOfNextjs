
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, HeartPulse, MapPin, Phone, 
  Calendar, Save, Loader2, ClipboardCheck, 
  AlertTriangle, Lock, Camera, CheckCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { User, PatientProfile } from '../types';

interface PatientProfilePageProps {
  onComplete?: () => void;
}

const PatientProfilePage = ({ onComplete }: PatientProfilePageProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [existingProfile, setExistingProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    allergies: '',
    medicalHistory: ''
  });

  useEffect(() => {
    const initPage = async () => {
      const currentUser = await api.getCurrentUser();
      if (!currentUser) {
        router.push('/');
        return;
      }
      setUser(currentUser);
      
      const profile = await api.getPatientProfileByUserId(currentUser.id);
      if (profile) {
        setExistingProfile(profile);
        setFormData({
          name: currentUser.name || '',
          phone: currentUser.phone || '',
          dob: profile.dateOfBirth || '',
          gender: profile.gender || 'Male',
          bloodGroup: profile.bloodGroup || 'O+',
          address: profile.address || '',
          emergencyContact: profile.emergencyContact || '',
          emergencyPhone: profile.emergencyPhone || '',
          allergies: profile.allergies || '',
          medicalHistory: profile.medicalHistory || ''
        });
      } else {
        setFormData(prev => ({
          ...prev,
          name: currentUser.name || '',
          phone: currentUser.phone || ''
        }));
      }
      setIsLoading(false);
    };

    initPage();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Update the User account info
      await api.updateUser(user.id, { 
        name: formData.name, 
        phone: formData.phone,
        isProfileComplete: true 
      });

      // 2. Upsert the Patient Profile details
      const patientData: PatientProfile = {
        id: existingProfile?.id || `p_${Date.now()}`,
        userId: user.id,
        patientId: existingProfile?.patientId || `PAT-${Math.floor(Math.random() * 9000) + 1000}`,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        allergies: formData.allergies,
        medicalHistory: formData.medicalHistory
      };

      await api.upsertPatientProfile(patientData);

      if (onComplete) {
        onComplete();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ClipboardCheck className="text-blue-600" /> 
          {user?.isProfileComplete ? 'Update Your Profile' : 'Complete Your Profile'}
        </h1>
        <p className="text-slate-500 mt-2">Please ensure all medical details are accurate for your consultations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Basic Info */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <UserIcon size={16} /> Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Full Name*</label>
              <input name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Phone Number*</label>
              <input name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
            </div>
          </div>
        </section>

        {/* Medical Details */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <HeartPulse size={16} /> Medical Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Date of Birth*</label>
              <input type="date" name="dob" required value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Gender*</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 transition-all">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Blood Group*</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 transition-all">
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Current Address</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none" />
          </div>
        </section>

        {/* Emergency & History */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={16} /> Emergency Contact & History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Contact Name</label>
              <input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Contact Phone</label>
              <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Known Allergies</label>
            <textarea name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="e.g. Penicillin, Peanuts..." rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1">Medical History Summary</label>
            <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} placeholder="Past surgeries, chronic conditions..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none resize-none" />
          </div>
        </section>

        <button 
          type="submit" 
          disabled={isSaving} 
          className="w-full bg-blue-600 text-white rounded-3xl py-5 font-bold shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />} 
          {user?.isProfileComplete ? 'Update Profile' : 'Save Profile & Continue'}
        </button>
      </form>
    </div>
  );
};

export default PatientProfilePage;
