import React from 'react';
import { User, Mail, Phone, Building, Car, Shield, Award, Calendar, CheckCircle, LogOut, X } from 'lucide-react';

const SUB_ROLE_LABELS = {
  admin_staff: 'Admin Staff',
  senior_manager: 'Senior Manager',
  staff_admin: 'Admin Staff',
  junior_staff: 'Admin Staff',
  senior_staff: 'Admin Staff',
  junior_manager: 'Senior Manager',
};

export default function ProfileModal({ isOpen, user, onClose, onLogout }) {
  if (!isOpen || !user) return null;

  const initials = (user.full_name || user.email || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const roleLabel = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User';
  const subRoleLabel = user.sub_role ? (SUB_ROLE_LABELS[user.sub_role] || user.sub_role) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with gradient banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-[#133fbd] to-indigo-800 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-2xl bg-white text-blue-800 font-black text-xl flex items-center justify-center shadow-lg border-2 border-white/20">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-snug">
                {user.full_name || user.email?.split('@')[0] || 'User Profile'}
              </h3>
              <p className="text-xs text-blue-100/90 font-medium">{user.email}</p>
              
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                  {roleLabel}
                </span>
                {subRoleLabel && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-900 border border-amber-300 shadow-xs">
                    {subRoleLabel}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-300" />
                  {user.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body: Personal Information Details */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
            Personal & Account Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <User className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="font-bold text-slate-700">{user.full_name || 'Not specified'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="font-bold text-slate-700 truncate block">{user.email}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                <span className="font-bold text-slate-700">{user.phone_number || '+94 77 000 0000'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Role</span>
                <span className="font-bold text-slate-700">{roleLabel}</span>
              </div>
            </div>

            {user.role === 'staff' && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 sm:col-span-2 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Staff Sub-Role</span>
                  <span className="font-extrabold text-blue-900 text-sm">{subRoleLabel || 'Admin Staff'}</span>
                  <p className="text-[10px] text-blue-600/80 font-medium mt-0.5">
                    {subRoleLabel === 'Senior Manager' 
                      ? 'Executive administrative privilege: Full management over users, units, complaints, events & finances.'
                      : 'Frontline administrative privilege: Daily operational management over notices, events, facilities & residents.'}
                  </p>
                </div>
              </div>
            )}

            {(user.building_name || user.unit_number) && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Unit</span>
                  <span className="font-bold text-slate-700">{user.building_name || 'Block A'} - {user.unit_number || 'A01'}</span>
                </div>
              </div>
            )}

            {user.vehicle_number && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Car className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Vehicle</span>
                  <span className="font-bold text-slate-700 uppercase">{user.vehicle_number}</span>
                </div>
              </div>
            )}

            {user.nic_or_passport && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NIC / Passport</span>
                  <span className="font-bold text-slate-700">{user.nic_or_passport}</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account ID</span>
                <span className="font-bold text-slate-700">#USR-{String(user.id || 1).padStart(4, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
          
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
