import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  ApiResponse,
  AttendanceRecord,
  AttendanceSummary,
  PaginatedResult,
} from '../types';

export interface AdminAttendanceParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  department?: string;
  nik?: string;
  search?: string;
}

export const useAdminAttendanceLogs = (params: AdminAttendanceParams = {}) => {
  const { page = 1, limit = 10, startDate, endDate, status, department, nik, search } = params;

  return useQuery({
    queryKey: ['admin-attendance-logs', page, limit, startDate, endDate, status, department, nik, search],
    queryFn: async () => {
      // Filter out empty string/null/undefined params
      const cleanParams: Record<string, any> = { page, limit };
      if (startDate) cleanParams.startDate = startDate;
      if (endDate) cleanParams.endDate = endDate;
      if (status) cleanParams.status = status;
      if (department) cleanParams.department = department;
      if (nik) cleanParams.nik = nik;
      if (search && search.trim() !== '') cleanParams.search = search.trim();

      const res = await api.get<ApiResponse<PaginatedResult<AttendanceRecord>>>('/attendance/admin/logs', {
        params: cleanParams,
      });
      return res.data.data;
    },
  });
};

export const useAdminAttendanceSummary = (date?: string) => {
  return useQuery({
    queryKey: ['admin-attendance-summary', date],
    queryFn: async () => {
      const cleanParams: Record<string, any> = {};
      if (date) cleanParams.date = date;

      const res = await api.get<ApiResponse<AttendanceSummary>>('/attendance/admin/summary', {
        params: cleanParams,
      });
      return res.data.data;
    },
  });
};
