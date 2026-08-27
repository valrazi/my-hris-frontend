import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ApiResponse, PaginatedResult, User } from '../types';

export interface EmployeeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  nik?: string;
}

export interface CreateEmployeePayload {
  nik: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  role?: 'ADMIN' | 'EMPLOYEE';
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  id: string;
  isActive?: boolean;
}

export const useGetEmployees = (params: EmployeeFilterParams = {}) => {
  const { page = 1, limit = 10, search, department, nik } = params;

  return useQuery({
    queryKey: ['employees', page, limit, search, department, nik],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResult<User>>>('/employees', {
        params: { page, limit, search, department, nik },
      });
      return res.data.data;
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEmployeePayload) => {
      const res = await api.post<ApiResponse<User>>('/employees', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateEmployeePayload) => {
      const res = await api.patch<ApiResponse<User>>(`/employees/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<ApiResponse<{ deleted: boolean }>>(`/employees/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
