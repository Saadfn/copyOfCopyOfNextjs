import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, UserCog, ShieldCheck, Mail, Phone, 
  MoreVertical, ClipboardList, X, Save, User as UserIcon,
  Stethoscope, Briefcase, HeartPulse, Clock, Download, Database,
  AlertCircle, Timer, Building2
} from 'lucide-react';
import { UserRole, User, PatientProfile, DoctorProfile, Branch } from '../types';
import { exportToCSV } from '../utils/csvExport';
import { db, KEYS } from '../utils/storage';

// Removed React.FC to avoid issues with required children prop in certain environments
const UserManagement = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '123',
    isActive: true,
    branchId: '',
    // Doctor Specific
    specialization: '',
    licenseNumber: '',
    consultationFee: '150',
    slotDuration: '30',
    // Staff Specific
    department: '',
    employeeId: '',
    // Patient Specific
    patientId: `PAT-${Math.floor(Math.random() * 9000) + 1000}`,
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
    db.init();
    setUsersList(db.getTable<User>(KEYS.USERS));
    const brs = db.getTable<Branch>(KEYS.BRANCHES);
    setBranches(brs);
    if (brs.length > 0) {
      setFormData(prev => ({ ...prev, branchId: brs[0].id }));
    }
  }, []);

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.branchId) {
      alert("Please fill in required fields (Name, Email, and Branch)");
      return;
    }

    const userId = `u${Date.now()}`;

    // 1. Create Base User (User Table)
    const newUser: User = {
      id: userId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'N/A',
      role: selectedRole,
      isActive: formData.isActive,
    };

    // 2. Create Profile specific records (Doctor/Staff/Patient tables)
    if (selectedRole === UserRole.DOCTOR) {
      const doctorProfile: DoctorProfile = {
        id: `doc_${Date.now()}`,
        userId: userId,
        branchId: formData.branchId,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        consultationFee: parseInt(formData.consultationFee),
        slotDuration: parseInt(formData.slotDuration)
      };
      db.saveToTable(KEYS.DOCTORS, doctorProfile);
    } else if (selectedRole === UserRole.STAFF) {
      const staffProfile = {
        id: `stf_${Date.now()}`,
        userId: userId,
        branchId: formData.branchId,
        department: formData.department,
        employeeId: formData.employeeId || `EMP-${Date.now()}`,
        joinDate: new Date().toISOString().split('T')[0]
      };
      db.saveToTable(KEYS.STAFF, staffProfile);
    } else if (selectedRole === UserRole.PATIENT) {
      const patientProfile: PatientProfile = {
        id: `p_${Date.now()}`,
        userId: userId,
        patientId: formData.patientId,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        allergies: formData.allergies,
        medicalHistory: formData.medicalHistory
      };
      db.saveToTable(KEYS.PATIENTS, patientProfile);
    }

    // Save user to "table"
    const updatedUsers = db.saveToTable(KEYS.USERS, newUser);
    setUsersList(updatedUsers);
    setIsModalOpen(false);
    
    // Reset
    setFormData(prev => ({
      ...prev,
      name: '', email: '', phone: '', password: '123', isActive: true,
      specialization: '', licenseNumber: '', consultationFee: '150',
      slotDuration: '30', department: '',
      employeeId: '', dob: '', gender: 'Male', bloodGroup: 'O+',
      address: '', emergencyContact: '', emergencyPhone: '', 
      allergies: '', medicalHistory: '',
      patientId: `PAT-${Math.floor(Math.random() * 9000) + 1000}`
    }));

    alert(`${selectedRole} account and profile created successfully!`);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.DOCTOR: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.STAFF: return 'bg-teal-100 text-teal-700 border-teal-200';
      case UserRole.PATIENT: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm">Control system access and create profile data.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2 w-fit"
          >
            <Plus size={18} /> Add System User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto">
              {['ALL', UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF, UserRole.PATIENT].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    roleFilter === role ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://picsum.photos/seed/${user.id}/40/40`} className="w-10 h-10 rounded-full border border-slate-200" alt="" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">{user.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className={`text-xs font-bold ${user.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
                  <p className="text-xs text-slate-500 font-medium">Relational Data Persistence Enabled</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   Account Base Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name*</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="John Smith" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address*</label>
                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@stgeorgehospital.org" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">System Role</label>
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-blue-600">
                      <option value={UserRole.ADMIN}>Administrator</option>
                      <option value={UserRole.DOCTOR}>Doctor</option>
                      <option value={UserRole.STAFF}>Staff</option>
                      <option value={UserRole.PATIENT}>Patient</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="555-0199" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm" />
                  </div>
                </div>
              </section>

              {/* Branch Assignment - Relevant for all profiles */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Building2 size={16} /> Facility Assignment
                </h3>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Primary Branch*</label>
                    <select name="branchId" value={formData.branchId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-slate-900">
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                </div>
              </section>

              {selectedRole === UserRole.DOCTOR && (
                <section className="space-y-4 animate-in slide-in-from-top-2">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Stethoscope size={16} /> Doctor Profile (Mock Database Entry)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="space-y-1.5 md:col-span-2"><label className="text-xs font-bold text-slate-700">Specialization</label><input name="specialization" value={formData.specialization} onChange={handleInputChange} type="text" placeholder="Cardiology" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">License No.* (Unique)</label><input name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} type="text" placeholder="LIC-9988" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm uppercase" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Consultation Fee ($)*</label><input name="consultationFee" value={formData.consultationFee} onChange={handleInputChange} type="number" placeholder="150" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm" /></div>
                    <div className="space-y-1.5 md:col-span-2"><label className="text-xs font-bold text-slate-700">Slot Duration (mins)*</label><input name="slotDuration" value={formData.slotDuration} onChange={handleInputChange} type="number" placeholder="30" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-blue-600" /></div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[10px] text-blue-700 font-medium">
                    Note: Weekly schedules and overrides are managed separately in the Physician Sched menu.
                  </div>
                </section>
              )}

              {selectedRole === UserRole.PATIENT && (
                <section className="space-y-4 animate-in slide-in-from-top-2">
                  <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                    <HeartPulse size={16} /> Patient Profile (Mock Database Entry)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Patient ID (Auto)</label><input readOnly value={formData.patientId} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 text-sm font-mono" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Date of Birth</label><input name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm"><option>A+</option><option>O+</option><option>B+</option><option>AB+</option></select></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm"><option>Male</option><option>Female</option><option>Other</option></select></div>
                    
                    <div className="space-y-1.5 md:col-span-2"><label className="text-xs font-bold text-slate-700">Residential Address</label><input name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Street, City, Zip Code" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm" /></div>
                    
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Emergency Contact Name</label><input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} type="text" placeholder="Next of Kin Name" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Emergency Phone</label><input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} type="tel" placeholder="Emergency Phone Number" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm" /></div>
                    
                    <div className="space-y-1.5 md:col-span-2"><label className="text-xs font-bold text-slate-700">Allergies</label><textarea name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="List any known allergies..." className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm h-16 resize-none" /></div>
                    <div className="space-y-1.5 md:col-span-2"><label className="text-xs font-bold text-slate-700">Medical History Summary</label><textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} placeholder="Chronic conditions, surgeries, etc..." className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm h-20 resize-none" /></div>
                  </div>
                </section>
              )}

              {selectedRole === UserRole.STAFF && (
                <section className="space-y-4 animate-in slide-in-from-top-2">
                  <h3 className="text-sm font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={16} /> Staff Profile (Mock Database Entry)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Department</label><input name="department" value={formData.department} onChange={handleInputChange} type="text" placeholder="IT / Administration" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Employee ID</label><input name="employeeId" value={formData.employeeId} onChange={handleInputChange} type="text" placeholder="STF-1022" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm" /></div>
                  </div>
                </section>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
              <button onClick={handleSaveUser} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save to Mock Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
