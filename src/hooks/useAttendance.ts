import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { uploadPhotoViaPresignedUrl } from '../services/uploadService';
import {
  ApiResponse,
  AttendanceRecord,
  PaginatedResult,
} from '../types';

export interface ClockInPayload {
  photoFile: File;
  workNotes?: string;
  locationLatitude?: number;
  locationLongitude?: number;
}

export const useTodayStatus = () => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ clockedIn: boolean; clockedOut: boolean; attendance: AttendanceRecord | null }>>(
        '/attendance/today',
      );
      return res.data.data;
    },
  });
};

export const useMyAttendanceHistory = (page = 1, limit = 10, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['attendance', 'my-history', page, limit, startDate, endDate],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResult<AttendanceRecord>>>('/attendance/my-history', {
        params: { page, limit, startDate, endDate },
      });
      return res.data.data;
    },
  });
};

/**
 * 3-Step Presigned Clock In Mutation Flow:
 * 1. Step A & B: Upload photo directly to S3/R2 presigned URL via uploadPhotoViaPresignedUrl.
 * 2. Step C: Submit clock-in payload to backend with photoUrl & fileKey.
 */
export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClockInPayload) => {
      // Step A & B: Direct Presigned S3/R2 Upload
      const directUpload = await uploadPhotoViaPresignedUrl(payload.photoFile);

      // Step C: Send clock-in payload to backend Gateway
      const formData = new FormData();
      formData.append('photo', payload.photoFile);
      formData.append('photoUrl', directUpload.photoUrl);
      formData.append('fileKey', directUpload.fileKey);

      if (payload.workNotes) formData.append('workNotes', payload.workNotes);
      if (payload.locationLatitude) formData.append('locationLatitude', String(payload.locationLatitude));
      if (payload.locationLongitude) formData.append('locationLongitude', String(payload.locationLongitude));

      const res = await api.post<ApiResponse<AttendanceRecord>>('/attendance/clock-in', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workSummary?: string) => {
      const res = await api.post<ApiResponse<AttendanceRecord>>('/attendance/clock-out', {
        workSummary,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
};
