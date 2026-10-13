import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, Bell, X } from 'lucide-react';

export default function PopupModal({
  isOpen,
  onClose,
  title = 'System Notification',
  message = '',
  type = 'info', // 'info', 'success', 'warning', 'error', 'emergency'
  details = null, // key-value pairs or extra string
  actionLabel = 'Dismiss',
  onAction = null
}) {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          iconBg: 'bg-emerald-100 text-emerald-600',
          badge: 'bg-emerald-100 text-emerald-700',
          icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      case 'warning':
      case 'emergency':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100 text-red-600',
          badge: 'bg-red-100 text-red-700',
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          btn: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'error':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          iconBg: 'bg-rose-100 text-rose-600',
          badge: 'bg-rose-100 text-rose-700',
          icon: <XCircle className="w-6 h-6 text-rose-600" />,
          btn: 'bg-rose-600 hover:bg-rose-700 text-white'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
          icon: <Info className="w-6 h-6 text-blue-600" />,
          btn: 'bg-[#133fbd] hover:bg-[#0f3299] text-white'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${theme.iconBg}`}>
            {theme.icon}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${theme.badge}`}>
              {type.toUpperCase()}
            </span>
            <h3 className="text-base font-black text-slate-800 tracking-tight mt-1 leading-snug">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="px-6 pb-6 space-y-4">
          {message && (
            <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">
              {message}
            </p>
          )}

          {details && typeof details === 'object' && (
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-extrabold text-slate-700">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {details && typeof details === 'string' && (
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 whitespace-pre-line font-mono text-[11px]">
              {details}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>

          {onAction ? (
            <button
              onClick={() => {
                onAction();
                onClose();
              }}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm ${theme.btn}`}
            >
              {actionLabel}
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm ${theme.btn}`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
