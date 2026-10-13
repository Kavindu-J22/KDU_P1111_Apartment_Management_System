import React, { useState } from 'react';
import { Bell, AlertTriangle, FileText, Wrench, CreditCard, CheckCheck, Trash2, X, ChevronRight } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose, role = 'admin', customNotifications = [] }) {
  if (!isOpen) return null;

  // Default seed notification feed based on role if no custom ones passed
  const defaultList = [
    {
      id: 1,
      type: 'emergency',
      title: 'Emergency Pipe Inspection in Block B',
      message: 'Urgent plumbing inspection underway on 3rd floor. Brief water pressure interruption expected.',
      time: '10 mins ago',
      read: false,
      tag: 'Urgent'
    },
    {
      id: 2,
      type: 'notice',
      title: 'Annual Community AGM Meeting Announced',
      message: 'Management has posted the schedule for the upcoming resident assembly on October 29th.',
      time: '1 hour ago',
      read: false,
      tag: 'Notice'
    },
    {
      id: 3,
      type: 'complaint',
      title: 'Maintenance Ticket #CMP-104 Updated',
      message: 'Elevator servicing ticket status has been changed to In Progress by Senior Maintenance Tech.',
      time: '3 hours ago',
      read: false,
      tag: 'Work Order'
    },
    {
      id: 4,
      type: 'billing',
      title: 'Monthly Utility Invoices Dispatched',
      message: 'Maintenance and parking invoices for the current billing cycle have been generated.',
      time: 'Yesterday',
      read: true,
      tag: 'Finance'
    },
    {
      id: 5,
      type: 'emergency',
      title: 'Fire Safety Drill Notice',
      message: 'Scheduled community safety drill will take place on Saturday at 10:00 AM.',
      time: '2 days ago',
      read: true,
      tag: 'Security'
    }
  ];

  const [notifications, setNotifications] = useState(
    customNotifications.length > 0 ? customNotifications : defaultList
  );
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'notice':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'complaint':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden mt-12 sm:mt-0 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#133fbd]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white shadow-xs">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Alerts, updates and community announcements</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 text-xs font-bold transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto bg-white">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'emergency', label: 'Emergency' },
            { id: 'notice', label: 'Notices' },
            { id: 'complaint', label: 'Tasks' },
            { id: 'billing', label: 'Billing' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#133fbd] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200/80 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600">No notifications found</p>
              <p className="text-[10px] text-slate-400 mt-0.5">You're all caught up with your announcements.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start group ${
                  item.read
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70 shadow-xs'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold tracking-tight truncate ${item.read ? 'text-slate-700' : 'text-slate-900 font-extrabold'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[9px] font-semibold text-slate-400 shrink-0">{item.time}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                      item.type === 'emergency' 
                        ? 'bg-red-100 text-red-700' 
                        : item.type === 'billing'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.tag || item.type}
                    </span>
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-600 disabled:opacity-40 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#133fbd] hover:bg-[#0f3299] text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
