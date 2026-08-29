import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, RefreshCw, MapPin, LogOut, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useClockOut } from '../../hooks/useAttendance';

interface ClockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClockOutModal: React.FC<ClockOutModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workSummary, setWorkSummary] = useState('');
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isAcquiringRef = useRef(false);

  const clockOutMutation = useClockOut();

  const stopCamera = useCallback(() => {
    isAcquiringRef.current = false;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (isAcquiringRef.current) return;
    isAcquiringRef.current = true;

    // Clean up any existing stream first
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      // Guard: If while getUserMedia was pending, the user closed modal or captured photo
      if (!isAcquiringRef.current || !isOpen) {
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        return;
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError('Webcam access was denied or is unavailable. Switch to File Upload mode.');
    } finally {
      isAcquiringRef.current = false;
    }
  }, [isOpen]);

  // Handle camera start and teardown cleanly
  useEffect(() => {
    if (isOpen && mode === 'camera' && !previewUrl) {
      startCamera();
    } else {
      stopCamera();
    }

    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
      );
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, previewUrl, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Stop camera tracks immediately
    stopCamera();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `wfh-clockout-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetPhoto = () => {
    stopCamera();
    setPhotoFile(null);
    setPreviewUrl(null);
    // useEffect will safely and singly invoke startCamera()
  };

  const handleClose = () => {
    stopCamera();
    setPhotoFile(null);
    setPreviewUrl(null);
    setWorkSummary('');
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setSubmitError('Please capture or upload a selfie photo to clock out.');
      return;
    }

    try {
      setSubmitError(null);
      await clockOutMutation.mutateAsync({
        photoFile,
        workSummary,
        locationLatitude: location.lat,
        locationLongitude: location.lng,
      });

      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit WFH clock-out.';
      setSubmitError(typeof msg === 'string' ? msg : msg[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="End Work Shift (Clock Out)" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex rounded-md bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('camera'); resetPhoto(); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'camera' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Webcam Capture
          </button>
          <button
            type="button"
            onClick={() => { stopCamera(); setMode('upload'); resetPhoto(); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {/* Photo View / Camera Screen */}
        <div className="relative rounded-md overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-100">
          {previewUrl ? (
            <img src={previewUrl} alt="Captured WFH Clock-Out Selfie" className="w-full h-full object-cover" />
          ) : mode === 'camera' ? (
            cameraError ? (
              <div className="text-center p-6 text-slate-300 text-xs">
                <p>{cameraError}</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )
          ) : (
            <div className="text-center p-6">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <label className="cursor-pointer text-xs text-slate-600 font-semibold hover:underline">
                Choose a clock-out selfie photo file
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Action Controls for Photo Capture */}
        <div className="flex justify-between items-center">
          {previewUrl ? (
            <Button type="button" variant="outline" size="sm" onClick={resetPhoto} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retake Photo
            </Button>
          ) : mode === 'camera' && !cameraError ? (
            <Button type="button" variant="secondary" size="sm" onClick={capturePhoto} leftIcon={<Camera className="w-3.5 h-3.5" />}>
              Take Snapshot
            </Button>
          ) : null}

          {location.lat && (
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>GPS Tagged ({location.lat.toFixed(4)}, {location.lng?.toFixed(4)})</span>
            </div>
          )}
        </div>

        {/* End of Day Work Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            End-of-Day Work Completion Summary
          </label>
          <textarea
            rows={3}
            value={workSummary}
            onChange={(e) => setWorkSummary(e.target.value)}
            placeholder="Summarize the work and deliverables completed today before ending your shift..."
            className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={clockOutMutation.isPending}
            disabled={!photoFile}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Confirm Clock-Out
          </Button>
        </div>
      </form>
    </Modal>
  );
};
