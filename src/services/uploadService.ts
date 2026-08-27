import { api, s3DirectUploadClient } from './api';
import { ApiResponse, PresignedUrlResponse } from '../types';

export interface DirectUploadResult {
  fileKey: string;
  photoUrl: string;
}

/**
 * CRITICAL PRESIGNED URL UPLOAD FLOW:
 * Step A: Request a Presigned Upload URL from backend API Gateway.
 * Step B: Perform direct axios.put() of raw File binary to Cloudflare R2 / MinIO URL (NO Authorization header).
 * Step C: Return fileKey & photoUrl for final backend clock-in registration.
 */
export const uploadPhotoViaPresignedUrl = async (file: File): Promise<DirectUploadResult> => {
  // Sanitize filename and create unique object key
  const sanitizedName = file.name.replace(/\s+/g, '_');
  const fileKey = `attendance_photo/${Date.now()}-${sanitizedName}`;

  // Step A: Get Presigned URL from Backend API Gateway
  const res = await api.get<ApiResponse<PresignedUrlResponse>>('/media/presigned-url', {
    params: {
      fileKey,
      expirySeconds: 3600,
    },
  });

  const { presignedUrl } = res.data.data;

  // Step B: Direct PUT of raw file to R2 / MinIO storage using unauthenticated client
  await s3DirectUploadClient.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
  });

  // Strip query parameters to get the clean public object URL
  const photoUrl = presignedUrl.split('?')[0];

  return {
    fileKey,
    photoUrl,
  };
};
