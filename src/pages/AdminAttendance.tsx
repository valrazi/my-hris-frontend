import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  MapPin,
  FileText,
} from 'lucide-react';
import { Column, CustomTable } from '../components/common/CustomTable';
import { InputField } from '../components/common/InputField';
import { Modal } from '../components/common/Modal';
import { useAdminAttendanceLogs, useAdminAttendanceSummary } from '../hooks/useAdminAttendance';
import { AttendanceRecord } from '../types';

export const AdminAttendance: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const { data: logsData, isLoading } = useAdminAttendanceLogs({
    page,
    limit: 10,
    search,
    status,
    department,
  });

  const { data: summary } = useAdminAttendanceSummary();

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Employee Details',
      accessor: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-200">
            {item.employee?.firstName ? item.employee.firstName[0] : 'U'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
            </div>
            <div className="text-[11px] text-slate-500">
              {item.employee?.department || 'Department N/A'} • NIK: {item.employee?.nik || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: (item) => <span className="font-medium text-slate-800">{dayjs(item.date).format('MMM D, YYYY')}</span>,
    },
    {
      header: 'Clock In',
      accessor: (item) => (
        <div className="text-slate-700 font-medium">
          {dayjs(item.clockInTime).format('HH:mm:ss')}
        </div>
      ),
    },
    {
      header: 'Clock Out',
      accessor: (item) => (
        <div className="text-slate-700 font-medium">
          {item.clockOutTime ? dayjs(item.clockOutTime).format('HH:mm:ss') : '-'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
            item.status === 'PRESENT'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: 'Photo Proof',
      accessor: (item) => (
        <div className="flex items-center gap-2">
          {item.photoUrl ? (
            <button
              onClick={() => setSelectedRecord(item)}
              className="flex items-center gap-2 group text-left"
            >
              <img
                src={item.photoUrl}
                alt="Selfie Thumbnail"
                className="w-8 h-8 rounded-md object-cover border border-slate-200 group-hover:opacity-80 transition-opacity"
              />
              <span className="text-xs text-slate-600 group-hover:text-slate-900 group-hover:underline font-medium hidden sm:inline">
                Inspect Proof
              </span>
            </button>
          ) : (
            <span className="text-slate-400 text-xs">No Photo</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">HR Attendance Monitoring</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time control & WFH photo proof verification of submitted employee attendances</p>
      </div>

      {/* KPI Dashboard Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Employees</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{summary?.totalEmployees || 0}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Clocked In Today</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{summary?.presentCount || 0}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Late Today</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{summary?.lateCount || 0}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4">
          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserX className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Not Clocked In</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{summary?.notClockedInCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Filtering Bar */}
      <div className="bg-white p-4 rounded-md border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-72">
          <InputField
            placeholder="Search employee, NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-slate-200 py-2 px-3 text-xs text-slate-700 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="LATE">LATE</option>
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-md border border-slate-200 py-2 px-3 text-xs text-slate-700 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
      </div>

      {/* Attendance Logs Data Table */}
      <CustomTable
        columns={columns}
        data={logsData?.data || []}
        isLoading={isLoading}
        emptyMessage="No submitted attendance logs match your filters."
        pagination={{
          page,
          totalPages: logsData?.meta?.totalPages || 1,
          total: logsData?.meta?.total || 0,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* Detailed Full-Size Photo Lightbox Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`WFH Attendance Proof - ${selectedRecord.employee?.firstName || ''} ${selectedRecord.employee?.lastName || ''}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="rounded-md overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-200">
              <img
                src={selectedRecord.photoUrl}
                alt="Full WFH Photo Proof"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md border border-slate-200">
              <div>
                <span className="text-slate-500 block mb-0.5">Employee Name:</span>
                <span className="font-semibold text-slate-900">{selectedRecord.employee?.firstName} {selectedRecord.employee?.lastName}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">NIK / Department:</span>
                <span className="font-semibold text-slate-900">{selectedRecord.employee?.nik || 'N/A'} • {selectedRecord.employee?.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Clock In Timestamp:</span>
                <span className="font-semibold text-slate-900">{dayjs(selectedRecord.clockInTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Clock Out Timestamp:</span>
                <span className="font-semibold text-slate-900">{selectedRecord.clockOutTime ? dayjs(selectedRecord.clockOutTime).format('YYYY-MM-DD HH:mm:ss') : 'Not Clocked Out Yet'}</span>
              </div>
            </div>

            {selectedRecord.workNotes && (
              <div className="text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200 flex items-start gap-2">
                <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-800 block mb-1">Submitted Work Plan / Notes:</span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedRecord.workNotes}</p>
                </div>
              </div>
            )}

            {selectedRecord.locationLatitude && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>GPS Location Tag: Latitude {selectedRecord.locationLatitude}, Longitude {selectedRecord.locationLongitude}</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
