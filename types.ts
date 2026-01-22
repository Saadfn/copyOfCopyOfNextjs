
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  STAFF = 'STAFF',
  PATIENT = 'PATIENT'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum LabRequestStatus {
  PENDING = 'PENDING',
  COLLECTED = 'COLLECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID'
}

export enum OverrideStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
  isProfileComplete?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string;
  medicalHistory?: string;
  user?: User;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  branchId: string;
  specialization: string;
  licenseNumber: string;
  consultationFee: number;
  slotDuration: number;
  user?: User;
}

export interface DoctorWeeklySchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
}

export interface DoctorScheduleOverride {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  type: 'LEAVE' | 'SHIFT_CHANGE';
  startTime?: string;
  endTime?: string;
  reason: string;
  status: OverrideStatus;
}

export interface Appointment {
  id: string;
  appointmentNo: string;
  patientId: string;
  doctorId: string;
  branchId: string;
  scheduleId?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  dateTime: string; // ISO string used for Date conversions in UI
  duration: number; // Duration in minutes
  type: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  patient?: PatientProfile;
  doctor?: DoctorProfile;
}

export interface LabTestType {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  turnaroundTime: string;
  description: string;
  isActive: boolean;
}

export interface LabRequest {
  id: string;
  requestNo: string;
  patientId: string;
  testTypeId: string;
  branchId: string;
  status: LabRequestStatus;
  requestedAt: string;
  notes?: string;
  testType?: LabTestType;
}

export interface MedicalRecord {
  id: string;
  recordNo: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  treatmentPlan: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  code: string;
  category: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  requiresPrescription: boolean;
  isActive: boolean;
}

export interface Inventory {
  id: string;
  medicineId: string;
  branchId: string;
  quantity: number;
  reorderLevel: number;
  batchNumber: string;
  expiryDate: string;
  lastUpdated: string;
  medicine?: Medicine;
}

export interface Bill {
  id: string;
  billNo: string;
  patientId: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  patient?: PatientProfile;
}

export interface Room {
  id: string;
  branchId: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  dailyRate: number;
  isAvailable: boolean;
}
