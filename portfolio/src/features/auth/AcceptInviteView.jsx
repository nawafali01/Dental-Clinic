import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInviteSchema } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AcceptInviteView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loadingUser, setLoadingUser] = useState(true);
  const [invitedUser, setInvitedUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setErrorMsg("No invite token provided in the URL.");
        setLoadingUser(false);
        return;
      }

      const res = await authService.getInvitedUserByToken(token);
      if (res.success) {
        setInvitedUser(res.data);
      } else {
        setErrorMsg(res.message);
      }
      setLoadingUser(false);
    };

    fetchUser();
  }, [token]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    const res = await authService.acceptInvite(token, data.password);
    
    if (res.success) {
      // The auth service automatically logs them in. 
      // Redirect to onboarding.
      navigate('/onboarding');
    } else {
      setErrorMsg(res.message);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errorMsg && !invitedUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Invite</h2>
          <p className="text-slate-500 mb-6">{errorMsg}</p>
          <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-medium">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complete your setup</h1>
          <p className="text-sm text-slate-500 mt-1">Set your password to activate your account</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-slate-500 font-medium">Name</span>
            <span className="col-span-2 text-slate-900 font-semibold">{invitedUser.fullName}</span>
            
            <span className="text-slate-500 font-medium">Email</span>
            <span className="col-span-2 text-slate-900 font-semibold">{invitedUser.email}</span>
            
            <span className="text-slate-500 font-medium">Role</span>
            <span className="col-span-2 text-slate-900 font-semibold capitalize">{invitedUser.role.replace('_', ' ')}</span>
            
            <span className="text-slate-500 font-medium">Organization</span>
            <span className="col-span-2 text-slate-900 font-semibold">{invitedUser.organizationId ? 'Assigned' : 'Global / None'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">New Password</label>
            <input 
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-white text-slate-900 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
            />
            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
            <input 
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-white text-slate-900 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
          </div>

          <ul className="text-xs text-slate-500 space-y-1 py-2">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> Minimum 8 characters</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> At least one letter</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> At least one number</li>
          </ul>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set Password & Continue"}
          </button>
        </form>

      </div>
    </div>
  );
}
