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
      <div className="w-full max-w-md bg-white rounded-md border border-slate-200 p-8 shadow-sm">
        {/* Branding header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-10 h-10 rounded-md bg-slate-900 flex items-center justify-center text-white mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">WFH Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to your employee account</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-100 flex items-start gap-2.5 text-red-700 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        {/* Helper Credentials */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          <p className="font-medium text-slate-700">Demo Accounts:</p>
          <div className="flex justify-between bg-slate-50 p-2 rounded-md border border-slate-100">
            <span className="text-slate-600 font-medium">HR Admin:</span>
            <span className="font-mono text-slate-800">admin@example.com</span>
          </div>
          <div className="flex justify-between bg-slate-50 p-2 rounded-md border border-slate-100">
            <span className="text-slate-600 font-medium">Employee:</span>
            <span className="font-mono text-slate-800">employee@example.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
