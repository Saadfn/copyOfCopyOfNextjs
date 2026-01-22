import React, { useState, useEffect } from 'react';
import { Bed, Plus, Search, MoreVertical, CheckCircle2, XCircle, X, Save, Download, Building2, Users } from 'lucide-react';
import { Room, Branch } from '../types';
import { db, KEYS } from '../utils/storage';
import { exportToCSV } from '../utils/csvExport';

// Removed React.FC to avoid issues with required children prop in certain environments
const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    branchId: '',
    roomNumber: '',
    roomType: 'General Ward',
    capacity: 1,
    dailyRate: 0,
    isAvailable: true
  });

  useEffect(() => {
    const r = db.getTable<Room>(KEYS.ROOMS);
    const b = db.getTable<Branch>(KEYS.BRANCHES);
    setRooms(r);
    setBranches(b);
    if (b.length > 0) setFormData(prev => ({ ...prev, branchId: b[0].id }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      ...formData
    };
    const updated = db.saveToTable(KEYS.ROOMS, newRoom);
    setRooms(updated);
    setIsModalOpen(false);
    setFormData(prev => ({
      ...prev,
      roomNumber: '',
      capacity: 1,
      dailyRate: 0,
      isAvailable: true
    }));
  };

  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Unknown Branch';

  const filtered = rooms.filter(r => 
    r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bed className="text-blue-600" /> Facility Rooms
          </h1>
          <p className="text-slate-500 text-sm font-medium">Manage hospital rooms, wards, and capacity.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCSV(rooms, 'AuraHealth_Rooms')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by room number or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((room) => (
          <div key={room.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Bed size={24} />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${room.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {room.isAvailable ? 'Available' : 'Occupied'}
              </span>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Room {room.roomNumber}</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{room.roomType}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Daily Rate</p>
                <p className="text-lg font-bold text-slate-900">${room.dailyRate}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 size={16} className="text-slate-400" />
                <span className="text-xs font-medium truncate">{getBranchName(room.branchId)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 justify-end">
                <Users size={16} className="text-slate-400" />
                <span className="text-xs font-medium">Cap: {room.capacity}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="lg:col-span-3 py-12 text-center text-slate-400 font-medium">No rooms found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleSave} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Bed size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Room</h2>
                  <p className="text-xs text-slate-500 font-medium">Register a new room within a hospital branch.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Hospital Branch*</label>
                  <select name="branchId" required value={formData.branchId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-blue-600">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Room Number*</label>
                  <input name="roomNumber" required value={formData.roomNumber} onChange={handleInputChange} type="text" placeholder="e.g. 402B" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Room Type</label>
                  <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm">
                    <option>General Ward</option>
                    <option>Private Room</option>
                    <option>ICU</option>
                    <option>Operation Theater</option>
                    <option>Recovery Room</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Capacity (Beds)</label>
                  <input name="capacity" value={formData.capacity} onChange={handleInputChange} type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Daily Rate ($)</label>
                  <input name="dailyRate" value={formData.dailyRate} onChange={handleInputChange} type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} id="roomAvailCheck" className="w-4 h-4 rounded text-blue-600" />
                  <label htmlFor="roomAvailCheck" className="text-xs font-bold text-slate-600">Available for Admission</label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save size={18} /> Register Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
