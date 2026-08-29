export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  nik?: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ON_LEAVE' | 'ABSENT';

export interface AttendanceRecord {
  id: string;
  userId: string;
  employee?: {
    id: string;
    nik?: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    position?: string;
    avatarUrl?: string;
  };
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  photoUrl: string;
  photoFileKey?: string;
  clockOutPhotoUrl?: string;
  clockOutPhotoFileKey?: string;
  workNotes?: string;
  status: AttendanceStatus;
  locationLatitude?: number;
  locationLongitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
  durationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  date: string;
  totalEmployees: number;
  presentCount: number;
  lateCount: number;
  notClockedInCount: number;
  attendanceRate: number;
}

export interface PresignedUrlResponse {
  fileKey: string;
  presignedUrl: string;
  expiresInSeconds: number;
}
