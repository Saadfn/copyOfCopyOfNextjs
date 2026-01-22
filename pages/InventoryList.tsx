import React from 'react';
import { Pill, AlertCircle, ShoppingCart, Search, Plus, Download } from 'lucide-react';
import { mockInventory } from '../mockData';
import { exportToCSV } from '../utils/csvExport';

// Removed React.FC to avoid issues with required children prop in certain environments
const InventoryList = () => {
  const handleExport = () => {
    exportToCSV(mockInventory, 'AuraHealth_Inventory');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pharmacy Inventory</h1>
          <p className="text-slate-500 text-sm">Manage stock levels and medicine availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} /> Export CSV
          </button>
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <ShoppingCart size={18} /> Manage Orders
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus size={18} /> Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Pill size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Items</p>
            <h3 className="text-2xl font-bold text-slate-900">248</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-rose-600">12</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Incoming Orders</p>
            <h3 className="text-2xl font-bold text-emerald-600">5</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by generic name or code..." 
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm w-full outline-none"
            />
          </div>
          <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none">
            <option>All Categories</option>
            <option>Antibiotics</option>
            <option>Painkillers</option>
            <option>Antidiabetic</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Medicine</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">In Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.medicine?.name}</p>
                      <p className="text-xs text-slate-500 italic">{item.medicine?.genericName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.medicine?.category}</td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-bold ${item.quantity <= item.reorderLevel ? 'text-rose-600' : 'text-slate-900'}`}>
                      {item.quantity} Units
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">${item.medicine?.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {item.quantity <= item.reorderLevel ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 uppercase">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 text-sm font-bold hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
