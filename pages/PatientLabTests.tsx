
import React, { useState, useEffect } from 'react';
import { FlaskConical, Search, Plus, Filter, Clock, ChevronRight, X, Save, AlertCircle, CheckCircle2, FlaskRound as Flask, Activity, AlertTriangle } from 'lucide-react';
import { db, KEYS } from '../utils/storage';
import { LabTestType, LabRequest, PatientProfile, Branch, LabRequestStatus } from '../types';

const PatientLabTests: React.FC = () => {
  const [availableTests, setAvailableTests] = useState<LabTestType[]>([]);
  const [myRequests, setMyRequests] = useState<LabRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    testTypeId: '',
    branchId: '',
    notes: ''
  });

  useEffect(() => {
    const user = db.getCurrentUser();
    if (!user) return;
    
    const profiles = db.getTable<PatientProfile>(KEYS.PATIENTS);
    const profile = profiles.find(p => p.userId === user.id);
    setPatientProfile(profile || null);

    setAvailableTests(db.getTable<LabTestType>(KEYS.LAB_TEST_TYPES));
    setBranches(db.getTable<Branch>(KEYS.BRANCHES));
    
    const allRequests = db.getTable<LabRequest>(KEYS.LAB_REQUESTS);
    if (profile) {
      const enriched = allRequests
        .filter(r => r.patientId === profile.id)
        .map(r => ({
          ...r,
          testType: db.getTable<LabTestType>(KEYS.LAB_TEST_TYPES).find(t => t.id === r.testTypeId)
        }));
      setMyRequests(enriched);
    }
  }, []);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientProfile || !formData.testTypeId || !formData.branchId) return;

    const newRequest: LabRequest = {
      id: `lr_${Date.now()}`,
      requestNo: `LR-${Math.floor(Math.random() * 90000) + 10000}`,
      patientId: patientProfile.id,
      testTypeId: formData.testTypeId,
      branchId: formData.branchId,
      status: LabRequestStatus.PENDING,
      requestedAt: new Date().toISOString(),
      notes: formData.notes
    };

    const updated = db.saveToTable(KEYS.LAB_REQUESTS, newRequest);
    const enriched = updated
      .filter(r => r.patientId === patientProfile.id)
      .map(r => ({
        ...r,
        testType: availableTests.find(t => t.id === r.testTypeId)
      }));
    setMyRequests(enriched);
    setIsModalOpen(false);
    alert("Lab test requested successfully!");
  };

  const getStatusColor = (status: LabRequestStatus) => {
    switch (status) {
      case LabRequestStatus.COMPLETED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case LabRequestStatus.PENDING: return 'bg-amber-50 text-amber-600 border-amber-100';
      case LabRequestStatus.PROCESSING: return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="text-blue-600" /> Lab Tests & Diagnostics
          </h1>
          <p className="text-slate-500 text-sm">Request diagnostic procedures and view your results.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} /> Request New Test
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} /> My Lab Requests
          </h3>
          {myRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center">
              <Flask className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-medium">You haven't requested any lab tests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{req.testType?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.requestNo} • Requested {new Date(req.requestedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Turnaround</p>
                      <p className="text-sm font-bold text-slate-700">{req.testType?.turnaroundTime}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Catalog Preview Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
             <h3 className="font-bold mb-4 flex items-center gap-2">
               <Flask size={18} className="text-blue-400" /> Test Catalog
             </h3>
             <div className="relative mb-4">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
               <input 
                 type="text" placeholder="Search tests..." 
                 value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-blue-400"
               />
             </div>
             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {availableTests.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(test => (
                 <div key={test.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-help group">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-blue-400">{test.category}</span>
                     <span className="text-xs font-bold">${test.price}</span>
                   </div>
                   <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{test.name}</h5>
                   <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{test.description}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleRequestSubmit} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Request Diagnostic Test</h2>
                  <p className="text-xs text-slate-500 font-medium">Submit a request to our laboratory.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Select Laboratory Test*</label>
                <select 
                  required value={formData.testTypeId} 
                  onChange={(e) => setFormData(prev => ({ ...prev, testTypeId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-blue-600 outline-none"
                >
                  <option value="">Choose a test...</option>
                  {availableTests.map(t => <option key={t.id} value={t.id}>{t.name} (${t.price})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Sample Collection Facility*</label>
                <select 
                  required value={formData.branchId} 
                  onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Notes for Technician</label>
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Fasting status, specific concerns, etc..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
                <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Laboratory tests require on-site sample collection. After submitting, please visit the selected branch with your digital request ID.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientLabTests;
