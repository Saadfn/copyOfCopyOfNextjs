import React from 'react';
import { Database, Download, Trash2, RefreshCcw, Table, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { db, KEYS } from '../utils/storage';
import { exportToCSV } from '../utils/csvExport';

// Removed React.FC to avoid issues with required children prop in certain environments
const DatabaseManager = () => {
  const tables = [
    { name: 'Users', key: KEYS.USERS, file: 'User.csv' },
    { name: 'Patient Profiles', key: KEYS.PATIENTS, file: 'PatientProfile.csv' },
    { name: 'Doctor Profiles', key: KEYS.DOCTORS, file: 'DoctorProfile.csv' },
    { name: 'Staff Profiles', key: KEYS.STAFF, file: 'StaffProfile.csv' },
    { name: 'Branches', key: KEYS.BRANCHES, file: 'Branch.csv' },
    { name: 'Appointments', key: KEYS.APPOINTMENTS, file: 'Appointment.csv' },
    { name: 'Inventory', key: KEYS.INVENTORY, file: 'Inventory.csv' },
    { name: 'Medical Records', key: KEYS.RECORDS, file: 'MedicalRecord.csv' },
    { name: 'Bills', key: KEYS.BILLS, file: 'Bill.csv' },
  ];

  const handleExportTable = (key: string, fileName: string) => {
    const data = db.getTable(key);
    exportToCSV(data, fileName.split('.')[0]);
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will wipe the local database and reload initial mock data.")) {
      db.clear();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Database className="text-blue-600" size={32} /> Mock CSV Database
          </h1>
          <p className="text-slate-500">Centralized storage management. Export tables as CSV files for local records.</p>
        </div>
        <button 
          onClick={handleReset}
          className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2"
        >
          <RefreshCcw size={18} /> Reset Database
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div key={table.key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Table size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                {db.getTable(table.key).length} Records
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{table.name}</h3>
            <p className="text-sm text-slate-500 mb-6 flex items-center gap-1 font-mono">
              <FileSpreadsheet size={14} /> {table.file}
            </p>
            <button 
              onClick={() => handleExportTable(table.key, table.file)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              <Download size={18} /> Export as CSV
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-amber-500 text-white rounded-lg">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Developer Note on Persistence</h4>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            Data is currently stored in your browser's <b>localStorage</b>. To "save to a project folder", click the Export buttons above. 
            The system links accounts by <code>userId</code> automatically when you create a new Doctor, Staff, or Patient in <b>User Management</b>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
