import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, MapPin, Phone, Mail, 
  MoreVertical, CheckCircle2, XCircle, X, Save, 
  Globe, LayoutGrid, List, Download
} from 'lucide-react';
import { Branch } from '../types';
import { db, KEYS } from '../utils/storage';
import { exportToCSV } from '../utils/csvExport';

// Removed React.FC to avoid issues with required children prop in certain environments
const BranchManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    isActive: true
  });

  useEffect(() => {
    setBranches(db.getTable<Branch>(KEYS.BRANCHES));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Branch Name and Code are required.");
      return;
    }

    const newBranch: Branch = {
      id: `brn_${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString()
    };

    const updated = db.saveToTable(KEYS.BRANCHES, newBranch);
    setBranches(updated);
    setIsModalOpen(false);
    setFormData({
      name: '', code: '', address: '', city: '', 
      state: '', phone: '', email: '', isActive: true
    });
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-blue-600" /> Branch Network
          </h1>
          <p className="text-slate-500 text-sm font-medium">Manage hospital physical locations and infrastructure.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCSV(branches, 'AuraHealth_Branches')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} /> Add New Branch
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, code or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Building2 size={24} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${branch.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {branch.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {branch.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{branch.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{branch.code}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="leading-snug">{branch.address}, {branch.city}, {branch.state}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <p>{branch.phone}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <p className="truncate">{branch.email}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Added: {new Date(branch.createdAt).toLocaleDateString()}</p>
                <button className="text-blue-600 text-sm font-bold hover:underline">Settings</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Branch Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{branch.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{branch.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{branch.city}, {branch.state}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{branch.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${branch.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {branch.isActive ? 'Active' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleSaveBranch} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Facility</h2>
                  <p className="text-xs text-slate-500 font-medium">Configure a new hospital branch.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Branch Name*</label>
                  <input name="name" required value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g. Aura City Central" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Branch Code* (Unique)</label>
                  <input name="code" required value={formData.code} onChange={handleInputChange} type="text" placeholder="ACC-01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all uppercase" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">System Status</label>
                  <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 rounded-xl border border-slate-200">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} id="activeCheck" className="w-4 h-4 rounded text-blue-600" />
                    <label htmlFor="activeCheck" className="text-sm font-medium text-slate-600">Mark as Active</label>
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Street Address</label>
                  <input name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="123 Hospital Lane" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">City</label>
                  <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="Melbourne" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">State</label>
                  <input name="state" value={formData.state} onChange={handleInputChange} type="text" placeholder="" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Primary Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="555-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Official Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="contact@aura.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Register Branch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
