import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, CheckCircle, Clock, AlertTriangle, Play, LogOut, 
  Search, Bell, Settings, Building, ClipboardList, LayoutDashboard
} from 'lucide-react';

export default function MaintenanceDashboard() {
  const { api, user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      setErrorMsg('Failed to load work order complaints.');
    } finally {
      setLoading(false);
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
      setErrorMsg(error.response?.data?.message || 'Failed to update ticket status');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Metric summaries
  const totalTickets = complaints.length;
  const pendingTickets = complaints.filter(c => c.status === 'pending').length;
  const inProgressTickets = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedTickets = complaints.filter(c => c.status === 'resolved').length;

  const employeeName = user?.email ? user.email.split('@')[0].toUpperCase() : 'Maintenance Agent';

  // Filter complaints by search query
  const filteredComplaints = complaints.filter(c => 
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.resident_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7fd] text-slate-800 flex font-sans select-none antialiased">
      
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between h-screen sticky top-0">
        <div>
          {/* Logo Branding */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#133fbd] flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-800 leading-tight">AptManager</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee Console</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button className="w-full py-2 px-3 rounded-lg flex items-center gap-3 text-xs font-bold bg-[#133fbd] text-white shadow-md shadow-blue-900/10 text-left">
              <ClipboardList className="w-4.5 h-4.5 text-white" />
              <span>Work Orders</span>
            </button>
          </nav>
        </div>

        {/* Profile Card Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 uppercase">
              {employeeName.charAt(0)}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-tight">{employeeName}</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Maintenance Crew</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search work order descriptions or categories..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none text-slate-800 focus:border-blue-600 focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Settings className="w-4.5 h-4.5" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              M
            </div>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="p-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          
          {/* Status Notifications */}
          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span>•</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shadow-sm">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Maintenance Operations</h1>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Resolve resident complaints ordered by priority</p>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/50 p-4 rounded-xl shadow-sm">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Tickets</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalTickets}</h3>
            </div>
            <div className="bg-white border border-slate-200/50 p-4 rounded-xl shadow-sm">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Assignment</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{pendingTickets}</h3>
            </div>
            <div className="bg-white border border-slate-200/50 p-4 rounded-xl shadow-sm border-l-4 border-l-blue-600">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">In Progress</span>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{inProgressTickets}</h3>
            </div>
            <div className="bg-white border border-slate-200/50 p-4 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Resolved Tickets</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{resolvedTickets}</h3>
            </div>
          </div>

          {/* Work Orders List */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Work Order Tickets</h3>
            
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-700 text-sm font-bold">No active work orders registered!</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">All resident complaints have been resolved successfully.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredComplaints.map((c) => {
                  const priorityColors = {
                    high: 'border-l-red-500 bg-red-50/10',
                    medium: 'border-l-amber-500 bg-amber-50/10',
                    low: 'border-l-blue-500 bg-blue-50/10'
                  };

                  const statusBadges = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-100',
                    in_progress: 'bg-blue-50 text-blue-700 border-blue-100',
                    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  };

                  return (
                    <div 
                      key={c.id}
                      className={`p-5 rounded-xl border border-slate-200/80 border-l-4 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 bg-white ${
                        priorityColors[c.priority] || 'border-l-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusBadges[c.status]}`}>
                              {c.status.replace('_', ' ')}
                            </span>
                            <span className="ml-2 text-xs font-bold text-slate-400">#CMP-{c.id}</span>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                            c.priority === 'high' ? 'bg-red-100 text-red-700' :
                            c.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {c.priority} Priority
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-sm mb-1">{c.category}</h4>
                        <p className="text-slate-500 text-xs font-sans leading-relaxed mb-4">{c.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                        <div className="text-slate-400 space-y-0.5">
                          <p className="text-slate-500">Resident: <span className="font-semibold text-slate-600">{c.resident_email}</span></p>
                          <p className="font-semibold">Filed: {new Date(c.created_at).toLocaleDateString()}</p>
                        </div>

                        {/* Actions */}
                        <div>
                          {c.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(c.id, 'in_progress')}
                              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Start Work</span>
                            </button>
                          )}
                          {c.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(c.id, 'resolved')}
                              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Resolve Ticket</span>
                            </button>
                          )}
                          {c.status === 'resolved' && (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Completed</span>
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

        </main>
      </div>

    </div>
  );
}
