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
      const res = await api.get<ApiResponse<PaginatedResult<AttendanceRecord>>>('/attendance/admin/logs', {
        params: { page, limit, startDate, endDate, status, department, nik, search },
      });
      return res.data.data;
    },
  });
};

export const useAdminAttendanceSummary = (date?: string) => {
  return useQuery({
    queryKey: ['admin-attendance-summary', date],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AttendanceSummary>>('/attendance/admin/summary', {
        params: { date },
      });
      return res.data.data;
    },
  });
};
