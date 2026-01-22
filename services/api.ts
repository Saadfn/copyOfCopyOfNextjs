
import { db, KEYS } from '../utils/storage';
import { 
  User, PatientProfile, DoctorProfile, Appointment, 
  Medicine, Inventory, Bill, Branch, LabTestType, 
  Room, AppointmentStatus 
} from '../types';

// Utility to simulate network delay for realistic integration
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API SERVICE LAYER
 * Replace the implementations inside these functions with fetch('your-api-url') 
 * when moving to FastAPI or PHP Laravel.
 */

export const api = {
  // --- AUTH & USER ---
  getCurrentUser: async (): Promise<User | null> => {
    return db.getCurrentUser();
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    await delay(300);
    const updated = db.updateInTable<User>(KEYS.USERS, id, updates);
    const user = updated.find(u => u.id === id) || null;
    if (user) {
      // Sync local session if we are updating the current user
      const current = db.getCurrentUser();
      if (current?.id === id) {
        localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
      }
    }
    return user;
  },

  // --- PATIENTS ---
  getPatients: async (): Promise<PatientProfile[]> => {
    await delay();
    return db.getTable<PatientProfile>(KEYS.PATIENTS);
  },

  getPatientById: async (id: string): Promise<PatientProfile | undefined> => {
    await delay();
    const patients = db.getTable<PatientProfile>(KEYS.PATIENTS);
    return patients.find(p => p.id === id);
  },

  getPatientProfileByUserId: async (userId: string): Promise<PatientProfile | undefined> => {
    await delay(200);
    const patients = db.getTable<PatientProfile>(KEYS.PATIENTS);
    return patients.find(p => p.userId === userId);
  },

  upsertPatientProfile: async (profile: PatientProfile): Promise<PatientProfile> => {
    await delay(400);
    const patients = db.getTable<PatientProfile>(KEYS.PATIENTS);
    const exists = patients.find(p => p.userId === profile.userId || p.id === profile.id);
    
    if (exists) {
      db.updateInTable<PatientProfile>(KEYS.PATIENTS, exists.id, profile);
      return { ...exists, ...profile };
    } else {
      db.saveToTable(KEYS.PATIENTS, profile);
      return profile;
    }
  },

  // --- APPOINTMENTS ---
  getAppointments: async (role?: string, userId?: string): Promise<Appointment[]> => {
    await delay();
    const allApps = db.getTable<Appointment>(KEYS.APPOINTMENTS);
    const docs = db.getTable<DoctorProfile>(KEYS.DOCTORS);
    const pats = db.getTable<PatientProfile>(KEYS.PATIENTS);
    const users = db.getTable<User>(KEYS.USERS);

    const enriched = allApps.map(app => {
      const doc = docs.find(d => d.id === app.doctorId);
      const pat = pats.find(p => p.id === app.patientId);
      return {
        ...app,
        doctor: doc ? { ...doc, user: users.find(u => u.id === doc.userId) } : undefined,
        patient: pat ? { ...pat, user: users.find(u => u.id === pat.userId) } : undefined
      };
    });

    if (role === 'PATIENT' && userId) {
      const profile = pats.find(p => p.userId === userId);
      return enriched.filter(a => a.patientId === profile?.id);
    }
    return enriched;
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus): Promise<void> => {
    await delay(300);
    db.updateInTable<Appointment>(KEYS.APPOINTMENTS, id, { status });
  },

  // --- INVENTORY & MEDICINES ---
  getInventory: async (branchId?: string): Promise<Inventory[]> => {
    await delay();
    const inv = db.getTable<Inventory>(KEYS.INVENTORY);
    const meds = db.getTable<Medicine>(KEYS.MEDICINES);
    const enriched = inv.map(i => ({
      ...i,
      medicine: meds.find(m => m.id === i.medicineId)
    }));
    return branchId && branchId !== 'ALL' ? enriched.filter(i => i.branchId === branchId) : enriched;
  },

  getMedicines: async (): Promise<Medicine[]> => {
    await delay();
    return db.getTable<Medicine>(KEYS.MEDICINES);
  },

  // --- BRANCHES ---
  getBranches: async (): Promise<Branch[]> => {
    await delay();
    return db.getTable<Branch>(KEYS.BRANCHES);
  },

  // --- LABS ---
  getLabTests: async (): Promise<LabTestType[]> => {
    await delay();
    return db.getTable<LabTestType>(KEYS.LAB_TEST_TYPES);
  },

  // --- ROOMS ---
  getRooms: async (): Promise<Room[]> => {
    await delay();
    return db.getTable<Room>(KEYS.ROOMS);
  },

  // --- BILLS ---
  getBills: async (): Promise<Bill[]> => {
    await delay();
    return db.getTable<Bill>(KEYS.BILLS);
  }
};
