
import { User, PatientProfile, DoctorProfile, Branch, Appointment, MedicalRecord, Medicine, Inventory, Bill, DoctorWeeklySchedule, DoctorScheduleOverride, UserRole, LabTestType, LabRequest } from '../types';
import { mockUsers, mockPatients, mockDoctors, mockBranches, mockAppointments, mockRecords, mockInventory, mockBills } from '../mockData';

const KEYS = {
  USERS: 'aura_users',
  PATIENTS: 'aura_patients',
  DOCTORS: 'aura_doctors',
  STAFF: 'aura_staff',
  BRANCHES: 'aura_branches',
  APPOINTMENTS: 'aura_appointments',
  RECORDS: 'aura_records',
  MEDICINES: 'aura_medicines',
  INVENTORY: 'aura_inventory',
  BILLS: 'aura_bills',
  DOCTOR_SCHEDULES: 'aura_dr_schedules',
  DOCTOR_OVERRIDES: 'aura_dr_overrides',
  LAB_TEST_TYPES: 'aura_lab_tests',
  LAB_REQUESTS: 'aura_lab_requests',
  ROOMS: 'aura_rooms',
  SESSION: 'aura_session',
  OTP_STORE: 'aura_otp_temp'
};

const isClient = typeof window !== 'undefined';

export const db = {
  init: () => {
    if (!isClient) return;
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(mockUsers));
      localStorage.setItem(KEYS.PATIENTS, JSON.stringify(mockPatients));
      localStorage.setItem(KEYS.DOCTORS, JSON.stringify(mockDoctors));
      localStorage.setItem(KEYS.BRANCHES, JSON.stringify(mockBranches));
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(mockAppointments));
      localStorage.setItem(KEYS.RECORDS, JSON.stringify(mockRecords));
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(mockInventory));
      localStorage.setItem(KEYS.BILLS, JSON.stringify(mockBills));
      localStorage.setItem(KEYS.STAFF, JSON.stringify([]));
      localStorage.setItem(KEYS.MEDICINES, JSON.stringify([]));
      localStorage.setItem(KEYS.DOCTOR_SCHEDULES, JSON.stringify([]));
      localStorage.setItem(KEYS.DOCTOR_OVERRIDES, JSON.stringify([]));
      localStorage.setItem(KEYS.LAB_TEST_TYPES, JSON.stringify([
        { id: 'lt1', name: 'Complete Blood Count', code: 'CBC', category: 'Hematology', price: 45, turnaroundTime: '24h', description: 'Checks overall health', isActive: true },
        { id: 'lt2', name: 'Lipid Profile', code: 'LPD', category: 'Biochemistry', price: 65, turnaroundTime: '48h', description: 'Cholesterol levels', isActive: true }
      ]));
      localStorage.setItem(KEYS.LAB_REQUESTS, JSON.stringify([]));
      localStorage.setItem(KEYS.ROOMS, JSON.stringify([]));
    }
  },

  getTable: <T>(key: string): T[] => {
    if (!isClient) return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveToTable: <T>(key: string, item: T) => {
    if (!isClient) return [];
    const table = db.getTable<T>(key);
    const updatedTable = [item, ...table];
    localStorage.setItem(key, JSON.stringify(updatedTable));
    return updatedTable;
  },

  updateInTable: <T extends { id: string }>(key: string, id: string, updates: Partial<T>) => {
    if (!isClient) return [];
    const table = db.getTable<T>(key);
    const updatedTable = table.map(item => item.id === id ? { ...item, ...updates } : item);
    localStorage.setItem(key, JSON.stringify(updatedTable));
    return updatedTable;
  },

  registerPatient: (email: string) => {
    if (!isClient) return false;
    const otp = "001122";
    localStorage.setItem(KEYS.OTP_STORE, JSON.stringify({ email, otp, expires: Date.now() + 600000 }));
    console.log(`[ST. GEORGE HMS RELAY] Sending OTP ${otp} to ${email} via dark7stars@gmail.com`);
    return true;
  },

  verifyOTP: (email: string, otp: string): User | null => {
    if (!isClient) return null;
    const stored = localStorage.getItem(KEYS.OTP_STORE);
    if (!stored) return null;
    const { email: sEmail, otp: sOtp, expires } = JSON.parse(stored);
    
    if (sEmail === email && sOtp === otp && Date.now() < expires) {
      const users = db.getTable<User>(KEYS.USERS);
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existing) {
        localStorage.setItem(KEYS.SESSION, JSON.stringify(existing));
        return existing;
      } else {
        const newUser: User = {
          id: `u_${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: UserRole.PATIENT,
          phone: '',
          isActive: true,
          isProfileComplete: false
        };
        db.saveToTable(KEYS.USERS, newUser);
        localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser));
        return newUser;
      }
    }
    return null;
  },

  login: (email: string, password: string): User | null => {
    if (!isClient) return null;
    const users = db.getTable<User>(KEYS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && password === "123") {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    if (!isClient) return;
    localStorage.removeItem(KEYS.SESSION);
    window.location.href = '/';
  },

  getCurrentUser: (): User | null => {
    if (!isClient) return null;
    const session = localStorage.getItem(KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  clear: () => {
    if (!isClient) return;
    localStorage.clear();
    window.location.reload();
  }
};

export { KEYS };
