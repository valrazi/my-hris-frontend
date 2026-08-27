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
              <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base tracking-tight">WFH Portal</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {!isAdmin && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
                    location.pathname === '/dashboard'
                      ? 'bg-slate-100 text-slate-900'
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
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
                      location.pathname === '/admin/employees'
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Employee Master
                  </Link>

                  <Link
                    to="/admin/attendance"
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
                      location.pathname === '/admin/attendance'
                        ? 'bg-slate-100 text-slate-900'
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
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                {user.firstName ? user.firstName[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-none mb-1">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user.role === 'ADMIN' ? 'HR Administrator' : user.position || 'Employee'}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
