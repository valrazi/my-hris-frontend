import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, LogOut, Users, CalendarCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? '/admin/employees' : '/dashboard'} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">WFH Portal</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {!isAdmin && (
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  My Attendance
                </Link>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/employees"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      location.pathname === '/admin/employees'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Employee Master
                  </Link>

                  <Link
                    to="/admin/attendance"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      location.pathname === '/admin/attendance'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Attendance Logs
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                {user.firstName ? user.firstName[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-900 leading-none mb-1">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {user.role === 'ADMIN' ? 'HR Administrator' : user.position || 'Employee'}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
              className="text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
