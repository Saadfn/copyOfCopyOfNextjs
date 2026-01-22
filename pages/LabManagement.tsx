import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, MoreVertical, CheckCircle2, XCircle, X, Save, Download, Clock, FlaskConical } from 'lucide-react';
import { LabTestType } from '../types';
import { db, KEYS } from '../utils/storage';
import { exportToCSV } from '../utils/csvExport';

// Removed React.FC to avoid issues with required children prop in certain environments
const LabManagement = () => {
  const [testTypes, setTestTypes] = useState<LabTestType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    price: 0,
    turnaroundTime: '24 Hours',
    description: '',
    isActive: true
  });

  useEffect(() => {
    setTestTypes(db.getTable<LabTestType>(KEYS.LAB_TEST_TYPES));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest: LabTestType = {
      id: `lab_${Date.now()}`,
      ...formData
    };
    const updated = db.saveToTable(KEYS.LAB_TEST_TYPES, newTest);
    setTestTypes(updated);
    setIsModalOpen(false);
    setFormData({
      name: '', code: '', category: '', price: 0, 
      turnaroundTime: '24 Hours', description: '', isActive: true
    });
  };

  const filtered = testTypes.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="text-blue-600" /> Lab Diagnostics
          </h1>
          <p className="text-slate-500 text-sm font-medium">Define and manage diagnostic test procedures.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCSV(testTypes, 'AuraHealth_LabTests')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Add Test Type
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by test name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Test Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">TAT</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{test.name}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{test.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{test.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{test.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">${test.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" /> {test.turnaroundTime}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${test.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">No lab tests defined yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleSave} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Define Lab Test</h2>
                  <p className="text-xs text-slate-500 font-medium">Add a new diagnostic service to the lab.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Test Name*</label>
                  <input name="name" required value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g. Complete Blood Count (CBC)" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Test Code* (Unique)</label>
                  <input name="code" required value={formData.code} onChange={handleInputChange} type="text" placeholder="LAB-101" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Category</label>
                  <input name="category" value={formData.category} onChange={handleInputChange} type="text" placeholder="Hematology" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Price ($)*</label>
                  <input name="price" required value={formData.price} onChange={handleInputChange} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Turnaround Time (TAT)</label>
                  <input name="turnaroundTime" value={formData.turnaroundTime} onChange={handleInputChange} type="text" placeholder="e.g. 24 Hours" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Detailed test scope..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm h-24" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} id="activeLabCheck" className="w-4 h-4 rounded text-blue-600" />
                  <label htmlFor="activeLabCheck" className="text-xs font-bold text-slate-600">Mark as Active Service</label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Register Lab Test
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LabManagement;
