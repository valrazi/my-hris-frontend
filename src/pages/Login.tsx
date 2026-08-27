import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ShieldAlert, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ApiResponse, AuthResponse } from '../types';
import { InputField } from '../components/common/InputField';
import { Button } from '../components/common/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setErrorMessage(null);
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', values);
      const { user, tokens } = res.data.data;

      login(user, tokens.accessToken, tokens.refreshToken);

      // Route user based on their role
      if (user.role === 'ADMIN') {
        navigate('/admin/employees');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMessage(typeof msg === 'string' ? msg : msg[0] || 'Authentication error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">WFH Attendance System</h1>
          <p className="text-blue-100 text-sm mt-1">Sign in to your corporate portal</p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              isLoading={isSubmitting}
            >
              Sign In to Account
            </Button>
          </form>

          {/* Preset Helper Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">Demo Accounts:</p>
            <div className="flex justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="font-medium text-slate-600">HR Admin:</span>
              <span className="font-mono text-blue-600">admin@example.com</span>
            </div>
            <div className="flex justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="font-medium text-slate-600">Employee:</span>
              <span className="font-mono text-blue-600">employee@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
