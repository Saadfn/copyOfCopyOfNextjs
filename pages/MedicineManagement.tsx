import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, MoreVertical, CheckCircle2, XCircle, X, Save, Download, Filter, Package } from 'lucide-react';
import { Medicine } from '../types';
import { db, KEYS } from '../utils/storage';
import { exportToCSV } from '../utils/csvExport';

// Removed React.FC to avoid issues with required children prop in certain environments
const MedicineManagement = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    code: '',
    category: '',
    manufacturer: '',
    dosageForm: 'Tablet',
    strength: '',
    unitPrice: 0,
    requiresPrescription: true,
    isActive: true
  });

  useEffect(() => {
    setMedicines(db.getTable<Medicine>(KEYS.MEDICINES));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newMedicine: Medicine = {
      id: `med_${Date.now()}`,
      ...formData
    };
    const updated = db.saveToTable(KEYS.MEDICINES, newMedicine);
    setMedicines(updated);
    setIsModalOpen(false);
    setFormData({
      name: '', genericName: '', code: '', category: '', 
      manufacturer: '', dosageForm: 'Tablet', strength: '',
      unitPrice: 0, requiresPrescription: true, isActive: true
    });
  };

  const filtered = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="text-blue-600" /> Pharmacy Catalog
          </h1>
          <p className="text-slate-500 text-sm font-medium">Manage and register pharmaceutical products.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCSV(medicines, 'AuraHealth_MedicineCatalog')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Register Medicine
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, generic name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Medicine Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Manufacturer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Rx Required</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{med.code} • {med.strength}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{med.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{med.manufacturer}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">${med.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${med.requiresPrescription ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {med.requiresPrescription ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">No medicines found in catalog.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleSave} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pill size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Medicine</h2>
                  <p className="text-xs text-slate-500 font-medium">Define specifications for the pharmacy registry.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Commercial Name*</label>
                  <input name="name" required value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g. Lipitor" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Generic Name</label>
                  <input name="genericName" value={formData.genericName} onChange={handleInputChange} type="text" placeholder="e.g. Atorvastatin" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Medicine Code* (Unique)</label>
                  <input name="code" required value={formData.code} onChange={handleInputChange} type="text" placeholder="MED-1001" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Category</label>
                  <input name="category" value={formData.category} onChange={handleInputChange} type="text" placeholder="e.g. Statins" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Manufacturer</label>
                  <input name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} type="text" placeholder="Pfizer" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Dosage Form</label>
                  <select name="dosageForm" value={formData.dosageForm} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm">
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Injection</option>
                    <option>Syrup</option>
                    <option>Ointment</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Strength</label>
                  <input name="strength" value={formData.strength} onChange={handleInputChange} type="text" placeholder="10mg" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Unit Price ($)</label>
                  <input name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5 flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="requiresPrescription" checked={formData.requiresPrescription} onChange={handleInputChange} id="rxCheck" className="w-4 h-4 rounded text-blue-600" />
                    <label htmlFor="rxCheck" className="text-xs font-bold text-slate-600">Rx Required</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} id="activeCheck" className="w-4 h-4 rounded text-blue-600" />
                    <label htmlFor="activeCheck" className="text-xs font-bold text-slate-600">Active</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Register Medicine
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
