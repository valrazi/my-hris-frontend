import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Calendar, Clock, LogIn, LogOut, CheckCircle, AlertCircle, Image as ImageIcon, LogOut as LogOutIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTodayStatus, useMyAttendanceHistory, useClockOut } from '../hooks/useAttendance';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ClockInModal } from '../components/attendance/ClockInModal';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [now, setNow] = useState(dayjs());
  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [isClockOutOpen, setIsClockOutOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: todayStatus, isLoading: isTodayLoading } = useTodayStatus();
  const { data: historyData, isLoading: isHistoryLoading } = useMyAttendanceHistory(1, 10);
  const clockOutMutation = useClockOut();

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync(clockOutNotes);
      setIsClockOutOpen(false);
      setClockOutNotes('');
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Date/Time Clock & Greeting */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>{now.format('dddd, MMMM D, YYYY')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {user?.department || 'Employee'} • NIK: {user?.nik || 'N/A'}
          </p>
        </div>

        {/* Real-time Clock Widget */}
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 text-center md:text-right">
          <div className="text-xs text-slate-300 font-medium mb-0.5">CURRENT LOCAL TIME</div>
          <div className="text-3xl font-mono font-bold tracking-tight text-white flex items-center justify-center md:justify-end gap-2">
            <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
            {now.format('HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Clock In / Out Action Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            todayStatus?.clockedIn
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            {todayStatus?.clockedIn ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
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
              size="lg"
              onClick={() => setIsClockInOpen(true)}
              leftIcon={<LogIn className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700"
            >
              Clock In Now
            </Button>
          ) : !todayStatus?.clockedOut ? (
            <Button
              variant="danger"
              size="lg"
              onClick={() => setIsClockOutOpen(true)}
              leftIcon={<LogOut className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Clock Out
            </Button>
          ) : (
            <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
              Shift Completed
            </span>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Personal Attendance History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Clock In</th>
                <th className="px-6 py-3.5">Clock Out</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Photo Proof</th>
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
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        record.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {record.photoUrl ? (
                        <button
                          onClick={() => setSelectedPhoto(record.photoUrl)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <ImageIcon className="w-4 h-4" />
                          View Photo
                        </button>
                      ) : (
                        '-'
                      )}
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

      {/* Clock Out Confirmation Modal */}
      <Modal isOpen={isClockOutOpen} onClose={() => setIsClockOutOpen(false)} title="End Work Shift (Clock Out)" maxWidth="md">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to end your work shift for today? You can optionally add an end-of-day work completion summary below:
          </p>
          <textarea
            rows={3}
            value={clockOutNotes}
            onChange={(e) => setClockOutNotes(e.target.value)}
            placeholder="End of day work summary..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsClockOutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={clockOutMutation.isPending}
              onClick={handleClockOut}
              leftIcon={<LogOutIcon className="w-4 h-4" />}
            >
              Confirm Clock Out
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-xl w-full bg-white rounded-2xl p-2 shadow-2xl">
            <img src={selectedPhoto} alt="WFH Proof" className="w-full h-auto rounded-xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
