import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../../schemas/auth.schema';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { buildRoleUrl } from '../../utils/getRoleBaseUrl';

export default function LoginView() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setAuthError('');
    const res = await login(data.email, data.password);
    
    if (res.success) {
      const user = res.data || res.user;
      const role = user?.role || 'clinic_manager';
      navigate(buildRoleUrl('/dashboard', role), { replace: true });
    } else {
      setAuthError(res.message || 'Login failed');
    }
  };

  const handleQuickFill = (email, password = 'password123') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        
        {/* Logo/Branding */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <input 
              {...register('email')}
              type="email"
              placeholder="name@example.com"
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-white text-slate-900 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
            />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <input 
                {...register('password')}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 pr-11 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-white text-slate-900 outline-none focus:ring-2 focus:ring-opacity-20 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
          </button>
        </form>

        {/* Demo Quick Fill Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Demo Fill
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('manager@test.com', 'password123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors text-center"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('orgadmin@test.com', 'password123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/60 transition-colors text-center"
            >
              Org Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('agent@test.com', 'password123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors text-center"
            >
              Agent
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('receptionist@test.com', 'password123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60 transition-colors text-center"
            >
              Receptionist
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('finance@test.com', 'password123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200/60 transition-colors text-center"
            >
              Finance
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('auditor@test.com', 'password123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300/60 transition-colors text-center"
            >
              Auditor
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
