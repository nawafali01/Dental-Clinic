import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { onboardingSchema } from '../../schemas/auth.schema';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function OnboardingView() {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { 
      phone: currentUser?.phone || '', 
      timezone: currentUser?.timezone || 'America/New_York'
    }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    const res = await updateProfile(data);
    
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {currentUser.fullName}!</h1>
          <p className="text-sm text-slate-500 mt-1">Let's finish setting up your profile</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Read-only Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Account Details (Read Only)</h3>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500">Email</label>
                <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm">{currentUser.email}</div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500">Role</label>
                <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500">Organization</label>
                <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm">{currentUser.organizationId ? 'Assigned' : 'Global / None'}</div>
              </div>
            </div>

            {/* Editable Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Personal Settings</h3>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                <input 
                  {...register('phone')}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-4 py-2 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-white text-slate-900 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                />
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Timezone</label>
                <select 
                  {...register('timezone')}
                  className={`w-full px-4 py-2 rounded-xl border ${errors.timezone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-white text-slate-900 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </select>
                {errors.timezone && <p className="text-xs text-red-500 font-medium">{errors.timezone.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup & Go to Dashboard"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
