import React from 'react';
import { 
  Users, Building, FileText, Wrench, Calendar, Megaphone, 
  CreditCard, ExternalLink, ChevronRight, Search 
} from 'lucide-react';

export default function GlobalSearchDropdown({
  query = '',
  isOpen = false,
  onClose,
  onNavigate,
  onSelectItem,
  records = {
    tabs: [],
    users: [],
    complaints: [],
    notices: [],
    events: [],
    bills: []
  }
}) {
  if (!isOpen || !query || query.trim().length < 1) return null;

  const q = query.toLowerCase().trim();

  // 1. Matching Navigation tabs
  const matchingTabs = (records.tabs || []).filter(tab => 
    tab.label.toLowerCase().includes(q) || tab.id.toLowerCase().includes(q)
  );

  // 2. Matching users/residents
  const matchingUsers = (records.users || []).filter(u => 
    (u.full_name || '').toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q) ||
    (u.unit_number || '').toLowerCase().includes(q) ||
    (u.role || '').toLowerCase().includes(q)
  ).slice(0, 4);

  // 3. Matching complaints / tasks
  const matchingComplaints = (records.complaints || []).filter(c => 
    (c.category || '').toLowerCase().includes(q) ||
    (c.description || '').toLowerCase().includes(q) ||
    String(c.id).includes(q) ||
    (c.resident_name || '').toLowerCase().includes(q)
  ).slice(0, 4);

  // 4. Matching notices
  const matchingNotices = (records.notices || []).filter(n => 
    (n.title || '').toLowerCase().includes(q) ||
    (n.content || '').toLowerCase().includes(q) ||
    (n.category || '').toLowerCase().includes(q)
  ).slice(0, 4);

  // 5. Matching events
  const matchingEvents = (records.events || []).filter(e => 
    (e.name || '').toLowerCase().includes(q) ||
    (e.type || '').toLowerCase().includes(q) ||
    (e.location || '').toLowerCase().includes(q)
  ).slice(0, 4);

  // 6. Matching bills
  const matchingBills = (records.bills || []).filter(b => 
    (b.description || '').toLowerCase().includes(q) ||
    (b.invoice_id || '').toLowerCase().includes(q) ||
    String(b.id).includes(q) ||
    (b.resident_name || '').toLowerCase().includes(q) ||
    (b.unit_number || '').toLowerCase().includes(q)
  ).slice(0, 4);

  const totalMatches = 
    matchingTabs.length + 
    matchingUsers.length + 
    matchingComplaints.length + 
    matchingNotices.length + 
    matchingEvents.length + 
    matchingBills.length;

  return (
    <div 
      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span className="flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span>Results for "{query}"</span>
        </span>
        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-700">
          {totalMatches} matches
        </span>
      </div>

      {totalMatches === 0 ? (
        <div className="p-6 text-center">
          <p className="text-xs font-semibold text-slate-400">No matching records found.</p>
          <p className="text-[10px] text-slate-400 mt-1">Try searching by keyword, unit number, name, or ticket ID.</p>
        </div>
      ) : (
        <div className="p-2 space-y-3 divide-y divide-slate-100">

          {/* Quick Page Navigation */}
          {matchingTabs.length > 0 && (
            <div className="pt-2 first:pt-0">
              <span className="px-3 text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Pages & Navigation
              </span>
              <div className="space-y-1">
                {matchingTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (onNavigate) onNavigate(tab.id);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-blue-50 text-xs font-bold text-slate-700 flex items-center justify-between transition cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-blue-600">→</span>
                      <span>Go to {tab.label}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Users */}
          {matchingUsers.length > 0 && (
            <div className="pt-2">
              <span className="px-3 text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Users & Residents
              </span>
              <div className="space-y-1">
                {matchingUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (onSelectItem) onSelectItem('user', u);
                      else if (onNavigate) onNavigate('residents');
                      onClose();
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{u.full_name || u.email}</p>
                      <p className="text-[10px] text-slate-400">{u.email} {u.unit_number ? `· Unit ${u.unit_number}` : ''}</p>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Complaints */}
          {matchingComplaints.length > 0 && (
            <div className="pt-2">
              <span className="px-3 text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Work Orders & Complaints
              </span>
              <div className="space-y-1">
                {matchingComplaints.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (onSelectItem) onSelectItem('complaint', c);
                      else if (onNavigate) onNavigate('complaints');
                      onClose();
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">#CMP-{c.id}: {c.category}</p>
                      <p className="text-[10px] text-slate-400 truncate">{c.description}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                      c.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Notices */}
          {matchingNotices.length > 0 && (
            <div className="pt-2">
              <span className="px-3 text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Notices & Announcements
              </span>
              <div className="space-y-1">
                {matchingNotices.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (onSelectItem) onSelectItem('notice', n);
                      else if (onNavigate) onNavigate('notices');
                      onClose();
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{n.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{n.content}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">
                      {n.category || 'Notice'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Events */}
          {matchingEvents.length > 0 && (
            <div className="pt-2">
              <span className="px-3 text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Community Events
              </span>
              <div className="space-y-1">
                {matchingEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      if (onSelectItem) onSelectItem('event', e);
                      else if (onNavigate) onNavigate('events');
                      onClose();
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{e.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{new Date(e.date).toLocaleDateString()} · {e.location}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 shrink-0">
                      {e.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Invoices */}
          {matchingBills.length > 0 && (
            <div className="pt-2">
              <span className="px-3 text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Invoices & Payments
              </span>
              <div className="space-y-1">
                {matchingBills.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      if (onSelectItem) onSelectItem('bill', b);
                      else if (onNavigate) onNavigate('bills');
                      onClose();
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{b.invoice_id || `#INV-${b.id}`}: {b.description}</p>
                      <p className="text-[10px] text-slate-400 truncate">LKR {b.amount} · Due {new Date(b.due_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                      b.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {b.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
