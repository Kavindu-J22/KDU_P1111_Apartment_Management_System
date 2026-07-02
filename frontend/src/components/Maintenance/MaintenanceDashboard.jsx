import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wrench, CheckCircle, Clock, AlertTriangle, Play } from 'lucide-react';

export default function MaintenanceDashboard() {
  const { api } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      setErrorMsg('Failed to load complaints. Please try again.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const res = await api.put(`/complaints/${complaintId}/status`, { status: newStatus });
      setSuccessMsg(res.data.message);
      fetchComplaints();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to update complaint status');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
          <Wrench className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Maintenance Operations Dashboard</h1>
          <p className="text-xs text-slate-400">Resolve resident complaints ordered by priority</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          {successMsg}
        </div>
      )}

      {/* Complaints Grid */}
      {complaints.length === 0 ? (
        <div className="glass-panel p-8 text-center rounded-xl">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No complaints registered in the system!</p>
          <p className="text-xs text-slate-500 mt-1">Excellent work, all systems are functioning properly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => {
            // Define styling based on priority
            const priorityStyles = {
              high: 'border-l-4 border-l-rose-500/80 bg-rose-500/5',
              medium: 'border-l-4 border-l-amber-500/80 bg-amber-500/5',
              low: 'border-l-4 border-l-sky-500/80 bg-sky-500/5'
            };

            const statusColors = {
              pending: 'bg-amber-500/15 text-amber-400',
              in_progress: 'bg-sky-500/15 text-sky-400',
              resolved: 'bg-emerald-500/15 text-emerald-400'
            };

            return (
              <div
                key={c.id}
                className={`glass-card p-5 rounded-xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 ${
                  priorityStyles[c.priority] || 'border-l-4 border-l-slate-700 bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[c.status]}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">#{c.id}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                      c.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-sky-500/20 text-sky-300'
                    }`}>
                      {c.priority} Priority
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-md mb-1">{c.category}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 font-sans">{c.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <p className="font-medium text-slate-300">Resident: {c.resident_email}</p>
                    <p className="text-slate-500 mt-0.5">Submitted: {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Actions depending on current status */}
                  <div className="flex items-center gap-2">
                    {c.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'in_progress')}
                        className="py-1.5 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Work
                      </button>
                    )}
                    {c.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'resolved')}
                        className="py-1.5 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}
                    {c.status === 'resolved' && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
