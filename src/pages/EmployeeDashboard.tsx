import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Calendar, Clock, LogIn, LogOut, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTodayStatus, useMyAttendanceHistory } from '../hooks/useAttendance';
import { Button } from '../components/common/Button';
import { ClockInModal } from '../components/attendance/ClockInModal';
import { ClockOutModal } from '../components/attendance/ClockOutModal';
import { AttendanceRecord } from '../types';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [now, setNow] = useState(dayjs());
  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [isClockOutOpen, setIsClockOutOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [activePhotoTab, setActivePhotoTab] = useState<'in' | 'out'>('in');

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: todayStatus, isLoading: isTodayLoading } = useTodayStatus();
  const { data: historyData, isLoading: isHistoryLoading } = useMyAttendanceHistory(1, 10);

  const openPhotoModal = (record: AttendanceRecord, tab: 'in' | 'out' = 'in') => {
    setSelectedRecord(record);
    setActivePhotoTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Date/Time Clock & Greeting */}
      <div className="bg-slate-900 rounded-md p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium tracking-wide mb-1">
            <Calendar className="w-4 h-4" />
            <span>{now.format('dddd, MMMM D, YYYY')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {user?.department || 'Employee'} • NIK: {user?.nik || 'N/A'}
          </p>
        </div>

        {/* Real-time Clock Widget */}
        <div className="border border-slate-800 px-6 py-3.5 rounded-md text-center md:text-right">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">CURRENT LOCAL TIME</div>
          <div className="text-2xl font-mono font-bold tracking-tight text-white flex items-center justify-center md:justify-end gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            {now.format('HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Clock In / Out Action Banner */}
      <div className="bg-white rounded-md p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
            todayStatus?.clockedIn
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            {todayStatus?.clockedIn ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {isTodayLoading
                ? 'Loading status...'
                : todayStatus?.clockedIn
                ? `Clocked In Today (${todayStatus.attendance?.status})`
                : 'Not Clocked In Yet'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {todayStatus?.clockedIn
                ? `Clocked in at ${dayjs(todayStatus.attendance?.clockInTime).format('HH:mm [WIB]')}`
                : 'Please capture a selfie photo to record your WFH attendance'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!todayStatus?.clockedIn ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsClockInOpen(true)}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Clock In Now
            </Button>
          ) : !todayStatus?.clockedOut ? (
            <Button
              variant="danger"
              size="md"
              onClick={() => setIsClockOutOpen(true)}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Clock Out
            </Button>
          ) : (
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
              Shift Completed
            </span>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Personal Attendance History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/50 text-[11px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Clock In</th>
                <th className="px-6 py-3.5">Clock Out</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Selfie Proofs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isHistoryLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading attendance records...
                  </td>
                </tr>
              ) : !historyData?.data || historyData.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No attendance history found.
                  </td>
                </tr>
              ) : (
                historyData.data.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {dayjs(record.date).format('MMM D, YYYY')}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {dayjs(record.clockInTime).format('HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {record.clockOutTime ? dayjs(record.clockOutTime).format('HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        record.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {record.photoUrl && (
                          <button
                            onClick={() => openPhotoModal(record, 'in')}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                            Clock-In
                          </button>
                        )}
                        {record.clockOutPhotoUrl && (
                          <button
                            onClick={() => openPhotoModal(record, 'out')}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                            Clock-Out
                          </button>
                        )}
                        {!record.photoUrl && !record.clockOutPhotoUrl && '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clock In Modal Component */}
      <ClockInModal isOpen={isClockInOpen} onClose={() => setIsClockInOpen(false)} />

      {/* Clock Out Modal Component */}
      <ClockOutModal isOpen={isClockOutOpen} onClose={() => setIsClockOutOpen(false)} />

      {/* Photo Lightbox Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
          <div className="relative max-w-xl w-full bg-white rounded-md p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                WFH Attendance Photo Proof ({dayjs(selectedRecord.date).format('MMMM D, YYYY')})
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Photo Tabs if both available */}
            {selectedRecord.clockOutPhotoUrl && (
              <div className="flex rounded-md bg-slate-100 p-1 mb-3">
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('in')}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                    activePhotoTab === 'in' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clock-In Selfie
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('out')}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                    activePhotoTab === 'out' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clock-Out Selfie
                </button>
              </div>
            )}

            <div className="rounded-md overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
              <img
                src={activePhotoTab === 'in' ? selectedRecord.photoUrl : (selectedRecord.clockOutPhotoUrl || selectedRecord.photoUrl)}
                alt="WFH Proof"
                className="w-full h-full object-contain"
              />
            </div>

            {selectedRecord.workNotes && (
              <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-700 whitespace-pre-line">
                <span className="font-semibold block text-slate-900 mb-1">Work Notes:</span>
                {selectedRecord.workNotes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
