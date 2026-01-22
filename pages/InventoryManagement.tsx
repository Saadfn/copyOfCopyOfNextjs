import React, { useState, useEffect } from 'react';
import { 
  Pill, Plus, Search, MoreVertical, AlertTriangle, 
  Calendar, Building2, Package, Save, X, Filter, 
  TrendingDown, TrendingUp, History, Download
} from 'lucide-react';
import { Inventory, Medicine, Branch } from '../types';
import { db, KEYS } from '../utils/storage';
import { exportToCSV } from '../utils/csvExport';

// Removed React.FC to avoid issues with required children prop in certain environments
const InventoryManagement = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState({
    medicineId: '',
    branchId: '',
    quantity: 0,
    reorderLevel: 20,
    batchNumber: '',
    expiryDate: ''
  });

  useEffect(() => {
    const inv = db.getTable<Inventory>(KEYS.INVENTORY);
    const meds = db.getTable<Medicine>(KEYS.MEDICINES);
    const brs = db.getTable<Branch>(KEYS.BRANCHES);
    
    // Enrich inventory with medicine details
    const enrichedInv = inv.map(i => ({
      ...i,
      medicine: meds.find(m => m.id === i.medicineId)
    }));
    
    setInventory(enrichedInv);
    setMedicines(meds);
    setBranches(brs);

    if (meds.length > 0) setFormData(prev => ({ ...prev, medicineId: meds[0].id }));
    if (brs.length > 0) setFormData(prev => ({ ...prev, branchId: brs[0].id }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicineId || !formData.branchId || !formData.batchNumber) {
      alert("Medicine, Branch and Batch Number are required.");
      return;
    }

    const newStock: Inventory = {
      id: `inv_${Date.now()}`,
      ...formData,
      lastUpdated: new Date().toISOString()
    };

    const updatedTable = db.saveToTable(KEYS.INVENTORY, newStock);
    
    // Refresh local state with enriched data
    const enriched = updatedTable.map(i => ({
      ...i,
      medicine: medicines.find(m => m.id === i.medicineId)
    }));
    setInventory(enriched);
    setIsModalOpen(false);
    
    // Reset form partially
    setFormData(prev => ({
      ...prev,
      quantity: 0,
      batchNumber: '',
      expiryDate: ''
    }));
  };

  const filteredInventory = inventory.filter(i => {
    const matchesSearch = i.medicine?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         i.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranchId === 'ALL' || i.branchId === selectedBranchId;
    return matchesSearch && matchesBranch;
  });

  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown';

  const checkExpiryStatus = (dateStr: string) => {
    if (!dateStr) return 'none';
    const expiry = new Date(dateStr);
    const today = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(today.getMonth() + 3);

    if (expiry <= today) return 'expired';
    if (expiry <= threeMonths) return 'near';
    return 'safe';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" /> Inventory & Stock
          </h1>
          <p className="text-slate-500 text-sm font-medium">Monitor and manage multi-branch pharmaceutical supplies.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCSV(inventory, 'AuraHealth_Stock_Report')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} /> Update Stock
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total SKU</p>
          <p className="text-2xl font-bold text-slate-900">{inventory.length}</p>
        </div>
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-sm">
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Critical Stock</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-rose-600">{inventory.filter(i => i.quantity <= i.reorderLevel).length}</p>
            <TrendingDown className="text-rose-400 mb-1" size={16} />
          </div>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Near Expiry</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-amber-600">{inventory.filter(i => checkExpiryStatus(i.expiryDate) === 'near').length}</p>
            <AlertTriangle className="text-amber-500 mb-1" size={16} />
          </div>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Total Items</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-blue-600">{inventory.reduce((sum, i) => sum + i.quantity, 0)}</p>
            <TrendingUp className="text-blue-500 mb-1" size={16} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by medicine name or batch ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none w-full md:w-auto"
          >
            <option value="ALL">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Medicine & Batch</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Branch</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Current Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Last Activity</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const expiryStatus = checkExpiryStatus(item.expiryDate);
                const isLowStock = item.quantity <= item.reorderLevel;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                          <Pill size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.medicine?.name}</p>
                          <p className="text-xs font-mono text-slate-400">BATCH: {item.batchNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Building2 size={14} className="text-slate-400" />
                        {getBranchName(item.branchId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                          {item.quantity} Units
                        </span>
                        {isLowStock && (
                          <span className="text-[10px] text-rose-500 font-bold uppercase flex items-center gap-1">
                            <AlertTriangle size={10} /> Reorder Level Reached
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        expiryStatus === 'expired' ? 'bg-rose-100 text-rose-600' : 
                        expiryStatus === 'near' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <Calendar size={12} />
                        {item.expiryDate || 'N/A'}
                        {expiryStatus === 'near' && ' (Soon)'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <History size={14} />
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">No stock records matching the criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleSave} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Update Stock Registry</h2>
                  <p className="text-xs text-slate-500 font-medium">Record batch arrival or update existing inventory.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Select Medicine*</label>
                  <select name="medicineId" required value={formData.medicineId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-blue-600">
                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.strength})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Hospital Branch*</label>
                  <select name="branchId" required value={formData.branchId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Batch Number*</label>
                  <input name="batchNumber" required value={formData.batchNumber} onChange={handleInputChange} type="text" placeholder="e.g. BT-99-A" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Quantity (Units)*</label>
                  <input name="quantity" required value={formData.quantity} onChange={handleInputChange} type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Reorder Level</label>
                  <input name="reorderLevel" value={formData.reorderLevel} onChange={handleInputChange} type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Expiry Date</label>
                  <input name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
                <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Submitting this form will update the central inventory table for the selected branch. 
                  Low stock and expiry alerts will be triggered based on these values.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Sync Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
