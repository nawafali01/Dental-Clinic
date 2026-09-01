import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../schemas/profile.schema';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfileView() {
  const { currentUser, updateProfile } = useAuth();
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { 
      fullName: currentUser?.fullName || '',
      phone: currentUser?.phone || '', 
      timezone: currentUser?.timezone || 'America/New_York',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // AuthContext's updateProfile calls userService.updateProfile which enforces 
    // that restricted fields (Role, Org, etc.) cannot be modified by the user.
    const res = await updateProfile({
      fullName: data.fullName,
      phone: data.phone,
      timezone: data.timezone,
      password: data.password || undefined // Only update if provided
    });
    
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal settings and account information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Read-only / System Information Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">System Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">{currentUser.email}</div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Organization</label>
                <div className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">{currentUser.organizationId ? 'Assigned to Org' : 'Global Access'}</div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Account Status</label>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentUser.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {currentUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                To update your email or role, please contact your system administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Editable Profile Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Editable Details</h3>
            
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 font-medium">{successMsg}</p>
              </div>
            )}
            
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input 
                    {...register('fullName')}
                    type="text"
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                  <input 
                    {...register('phone')}
                    type="tel"
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Timezone</label>
                <select 
                  {...register('timezone')}
                  className={`w-full max-w-md px-4 py-2.5 rounded-xl border ${errors.timezone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </select>
                {errors.timezone && <p className="text-xs text-red-500 font-medium">{errors.timezone.message}</p>}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Change Password</h4>
                <div className="space-y-1.5 max-w-md">
                  <label className="block text-sm font-semibold text-slate-700">New Password (leave blank to keep current)</label>
                  <input 
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                  />
                  {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
