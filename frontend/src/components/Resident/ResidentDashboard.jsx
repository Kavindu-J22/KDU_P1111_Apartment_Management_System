import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home, FileText, Wrench, Compass, Calendar, Users, Plus, Check, X, ShieldAlert, CreditCard
} from 'lucide-react';

export default function ResidentDashboard() {
  const { api, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data States
  const [myUnit, setMyUnit] = useState(null);
  const [bills, setBills] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [parkingSlots, setParkingSlots] = useState([]); // All slots to find available guest slots
  const [myParking, setMyParking] = useState([]); // User's active parking slots
  const [notices, setNotices] = useState([]);
  const [pendingTenants, setPendingTenants] = useState([]); // Homeowner only

  // Input states
  const [complaintForm, setComplaintForm] = useState({ category: '', description: '', priority: 'medium' });
  const [bookingForm, setBookingForm] = useState({ facility_name: 'Rooftop Lounge', date: '' });
  const [parkingForm, setParkingForm] = useState({ slot_number: '', guest_date: '' });

  const fetchData = async () => {
    try {
      // Always fetch user unit details first
      try {
        const unitRes = await api.get('/units/my-unit');
        setMyUnit(unitRes.data);
      } catch (err) {
        setMyUnit(null);
      }

      if (activeTab === 'overview') {
        const noticesRes = await api.get('/notices');
        setNotices(noticesRes.data.slice(0, 3)); // Top 3 recent

        try {
          const parkRes = await api.get('/parking/my-slots');
          setMyParking(parkRes.data);
        } catch (e) {}
      } else if (activeTab === 'bills') {
        const billsRes = await api.get('/bills');
        setBills(billsRes.data);
      } else if (activeTab === 'complaints') {
        const compRes = await api.get('/complaints');
        setComplaints(compRes.data);
      } else if (activeTab === 'booking') {
        const resRes = await api.get('/facilities/reservations');
        setReservations(resRes.data);
      } else if (activeTab === 'parking') {
        try {
          const parkRes = await api.get('/parking/my-slots');
          setMyParking(parkRes.data);
        } catch (e) {}

        const allParkRes = await api.get('/parking');
        // Filter unique guest slot templates for requesting dropdown
        const guestTemplates = [...new Set(allParkRes.data.filter(p => p.type === 'guest').map(p => p.slot_number))];
        setParkingSlots(guestTemplates);
      } else if (activeTab === 'tenants' && user.role === 'homeowner') {
        const approvalsRes = await api.get('/auth/pending-approvals');
        setPendingTenants(approvalsRes.data.tenants || []);
      }
    } catch (error) {
      console.error('Failed to fetch resident dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Pay Bill
  const handlePayBill = async (billId) => {
    try {
      await api.put(`/bills/${billId}/pay`);
      setSuccessMsg('Bill paid successfully via mock gateway!');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Payment failed');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', complaintForm);
      setSuccessMsg('Complaint submitted successfully.');
      setComplaintForm({ category: '', description: '', priority: 'medium' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Complaint submission failed');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Request Reservation
  const handleReserve = async (e) => {
    e.preventDefault();
    try {
      await api.post('/facilities/reserve', bookingForm);
      setSuccessMsg('Facility reservation requested! Pending Admin review.');
      setBookingForm({ facility_name: 'Rooftop Lounge', date: '' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Reservation request failed');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Request Guest Parking
  const handleRequestParking = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parking/request-guest', parkingForm);
      setSuccessMsg('Guest parking slot requested! Pending Admin approval.');
      setParkingForm({ slot_number: '', guest_date: '' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Guest parking request failed');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Homeowner tenant approvals (Double Approval Chain Step 1)
  const handleTenantApproval = async (tenantId, action) => {
    try {
      const res = await api.post('/auth/approve', { userId: tenantId, action });
      setSuccessMsg(res.data.message);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Action failed');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        {/* Profile Card */}
        <div className="glass-panel p-5 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">My Unit</h2>
          {myUnit ? (
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">{myUnit.block_name}</p>
              <p className="text-xs text-slate-300">Floor {myUnit.floor_number} • Unit {myUnit.unit_number}</p>
              <p className="text-xs text-sky-400 font-semibold mt-2">
                Allocated Space: {myUnit.parking_slot_number ? `Slot ${myUnit.parking_slot_number}` : 'No permanent slot'}
              </p>
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic flex items-center gap-1.5 p-2 rounded bg-slate-950/20 border border-slate-900">
              <ShieldAlert className="w-4 h-4 text-amber-500/80" /> Pending unit allocation by Admin.
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-1.5">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'bills', label: 'Utility Bills & Pay', icon: FileText },
            { id: 'complaints', label: 'File Complaints', icon: Wrench },
            { id: 'booking', label: 'Facility Booking', icon: Calendar },
            { id: 'parking', label: 'Guest Parking', icon: Compass },
            ...(user.role === 'homeowner' ? [{ id: 'tenants', label: 'Tenant Approvals', icon: Users }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full py-2.5 px-4 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-sky-600/25 border border-sky-500/30 text-sky-400'
                    : 'text-slate-400 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-3 flex flex-col gap-6">
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

        {/* tab = OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border border-sky-900/20">
              <h1 className="text-xl font-bold text-white mb-2">Welcome Home!</h1>
              <p className="text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
                Welcome to your resident dashboard. Here you can keep up with community notices, check utility bills, submit maintenance tickets, book common facilities, and reserve parking space.
              </p>
            </div>

            {/* Parking & Notice quick look */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-xl space-y-4">
                <h2 className="text-sm font-bold text-slate-300 tracking-wider uppercase">Active Parking Slots</h2>
                {myParking.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No parking slot assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {myParking.map((p) => (
                      <div key={p.id} className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{p.slot_number}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{p.type} Slot {p.guest_date ? `(for ${new Date(p.guest_date).toLocaleDateString()})` : ''}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Active</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-panel p-6 rounded-xl space-y-4">
                <h2 className="text-sm font-bold text-slate-300 tracking-wider uppercase">Recent Notices</h2>
                {notices.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No active announcements.</p>
                ) : (
                  <div className="space-y-3">
                    {notices.map((n) => (
                      <div key={n.id} className="border-b border-slate-800/80 pb-2.5 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs font-bold text-white">{n.title}</h4>
                          <span className="text-[9px] text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2">{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* tab = BILLS */}
        {activeTab === 'bills' && (
          <div className="glass-panel p-6 rounded-xl">
            <h2 className="text-lg font-bold text-white mb-4">Utility & Maintenance Bills</h2>
            {bills.length === 0 ? (
              <p className="text-slate-400 text-sm">No bills issued for your unit.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Invoice Details</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-900/10">
                        <td className="py-3.5">
                          <p className="font-medium text-white text-sm">{bill.description}</p>
                          <span className="text-[10px] text-slate-500">Issued: {new Date(bill.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3.5 text-slate-200 font-bold">${bill.amount}</td>
                        <td className="py-3.5 text-slate-400">
                          {new Date(bill.due_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            bill.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {bill.status === 'unpaid' && (
                            <button
                              onClick={() => handlePayBill(bill.id)}
                              className="py-1.5 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold inline-flex items-center gap-1 transition-all active:scale-95"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* tab = COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 glass-panel p-6 rounded-xl h-fit">
              <h2 className="text-md font-bold text-white mb-4">File Maintenance Request</h2>
              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Issue Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plumbing Leak / Electrical"
                    className="w-full glass-input text-sm"
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Priority Importance</label>
                  <select
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm outline-none"
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Provide Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about the issue..."
                    className="w-full glass-input text-sm font-sans"
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition active:scale-95"
                >
                  File Complaint
                </button>
              </form>
            </div>

            <div className="md:col-span-2 glass-panel p-6 rounded-xl">
              <h2 className="text-lg font-bold text-white mb-4">Complaint History</h2>
              {complaints.length === 0 ? (
                <p className="text-slate-400 text-sm">No complaints logged.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {complaints.map((c) => (
                    <div key={c.id} className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/60 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-white text-sm">{c.category}</h3>
                          <span className="text-[9px] text-slate-500">Filed: {new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                            c.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-sky-500/20 text-sky-300'
                          }`}>
                            {c.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            c.status === 'in_progress' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">{c.description}</p>
                      {c.assigned_staff_email && (
                        <div className="mt-3 pt-2.5 border-t border-slate-900/60 text-[10px] text-slate-500">
                          Assigned to: {c.assigned_staff_email}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* tab = BOOKING */}
        {activeTab === 'booking' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 glass-panel p-6 rounded-xl h-fit">
              <h2 className="text-md font-bold text-white mb-4">Reserve Common Facility</h2>
              <form onSubmit={handleReserve} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Select Facility</label>
                  <select
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm outline-none"
                    value={bookingForm.facility_name}
                    onChange={(e) => setBookingForm({ ...bookingForm, facility_name: e.target.value })}
                  >
                    <option value="Rooftop Lounge">Rooftop Lounge</option>
                    <option value="Swimming Pool Annex">Swimming Pool Annex</option>
                    <option value="Clubhouse Hall">Clubhouse Hall</option>
                    <option value="Tennis Court">Tennis Court</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Reservation Date</label>
                  <input
                    type="date"
                    required
                    className="w-full glass-input text-sm"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition active:scale-95"
                >
                  Book Area
                </button>
              </form>
            </div>

            <div className="md:col-span-2 glass-panel p-6 rounded-xl">
              <h2 className="text-lg font-bold text-white mb-4">My Bookings Registry</h2>
              {reservations.length === 0 ? (
                <p className="text-slate-400 text-sm">No reservations requested yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3">Facility</th>
                        <th className="pb-3">Booking Date</th>
                        <th className="pb-3">Request Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {reservations.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-900/10">
                          <td className="py-3.5 text-white font-medium">{r.facility_name}</td>
                          <td className="py-3.5 text-slate-400">
                            {new Date(r.date).toLocaleDateString()}
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                              r.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : r.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* tab = PARKING */}
        {activeTab === 'parking' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 glass-panel p-6 rounded-xl h-fit">
              <h2 className="text-md font-bold text-white mb-4 font-sans">Request Guest Parking</h2>
              <form onSubmit={handleRequestParking} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Select Guest Slot</label>
                  <select
                    required
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm outline-none"
                    value={parkingForm.slot_number}
                    onChange={(e) => setParkingForm({ ...parkingForm, slot_number: e.target.value })}
                  >
                    <option value="">-- Choose Slot --</option>
                    {parkingSlots.map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Date Needed</label>
                  <input
                    type="date"
                    required
                    className="w-full glass-input text-sm"
                    value={parkingForm.guest_date}
                    onChange={(e) => setParkingForm({ ...parkingForm, guest_date: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition active:scale-95"
                >
                  Request Guest Slot
                </button>
              </form>
            </div>

            <div className="md:col-span-2 glass-panel p-6 rounded-xl">
              <h2 className="text-lg font-bold text-white mb-4">My Parking Allotment</h2>
              {myParking.length === 0 ? (
                <p className="text-slate-400 text-sm">No parking slots reserved under your unit.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3">Slot Number</th>
                        <th className="pb-3">Parking Type</th>
                        <th className="pb-3">Scheduled Date</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {myParking.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/10">
                          <td className="py-3.5 font-bold text-sky-400">{p.slot_number}</td>
                          <td className="py-3.5 text-slate-300 capitalize">{p.type}</td>
                          <td className="py-3.5 text-slate-400">
                            {p.guest_date ? new Date(p.guest_date).toLocaleDateString() : 'Continuous'}
                          </td>
                          <td className="py-3.5 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.status === 'approved' || p.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : p.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* tab = TENANTS (Homeowner only) */}
        {activeTab === 'tenants' && user.role === 'homeowner' && (
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-white">Pending Tenant Requests</h2>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">Double-Approval Step 1</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Approve tenants seeking to rent your unit. Once approved, requests are sent to Administration for final clearance.</p>
            {pendingTenants.length === 0 ? (
              <p className="text-slate-400 text-sm">No pending tenant applications for your unit.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300 min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Full Name</th>
                      <th className="pb-3">Tenant Email</th>
                      <th className="pb-3">Apartment Info</th>
                      <th className="pb-3">Relationship</th>
                      <th className="pb-3">NIC / Passport</th>
                      <th className="pb-3">Phone</th>
                      <th className="pb-3">Request Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {pendingTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-900/10">
                        <td className="py-3.5 font-medium text-white">{t.full_name || 'N/A'}</td>
                        <td className="py-3.5 text-slate-300">{t.email}</td>
                        <td className="py-3.5 text-slate-300 text-xs">
                          {t.building_name} - {t.unit_number} {t.vehicle_number ? `(${t.vehicle_number})` : ''}
                        </td>
                        <td className="py-3.5 text-slate-400 capitalize">{t.relationship_to_owner || 'N/A'}</td>
                        <td className="py-3.5 text-slate-400">{t.nic_or_passport || 'N/A'}</td>
                        <td className="py-3.5 text-slate-400">{t.phone_number || 'N/A'}</td>
                        <td className="py-3.5 text-slate-400">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTenantApproval(t.id, 'approve')}
                            className="p-1.5 rounded bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 transition"
                            title="Approve Tenant"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTenantApproval(t.id, 'reject')}
                            className="p-1.5 rounded bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 transition"
                            title="Reject Tenant"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
