
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, FileText, Download, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { PatientProfile } from '../types';
import { exportToCSV } from '../utils/csvExport';

const PatientList = () => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await api.getPatients();
      setPatients(data);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const handleExport = () => {
    exportToCSV(patients, 'AuraHealth_Patients');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients Directory</h1>
          <p className="text-slate-500 text-sm">Manage and view all registered patients.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} /> Export CSV
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit">
            <Plus size={18} /> Add New Patient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-[400px] w-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter by name, ID or phone..." 
                  className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <Filter size={18} />
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Patient ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Gender / Age</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Blood Group</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://picsum.photos/seed/${patient.id}/40/40`} className="w-10 h-10 rounded-full border border-slate-200" alt="" />
                          <div>
                            <Link href={`/patients/${patient.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">{patient.user?.name}</Link>
                            <p className="text-xs text-slate-500">{patient.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{patient.patientId}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {patient.gender}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {patient.user?.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-rose-50 text-rose-600 uppercase">{patient.bloodGroup}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/patients/${patient.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FileText size={18} />
                          </Link>
                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientList;
