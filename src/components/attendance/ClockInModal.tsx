import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, RefreshCw, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useClockIn } from '../../hooks/useAttendance';

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClockInModal: React.FC<ClockInModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workNotes, setWorkNotes] = useState('');
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const clockInMutation = useClockIn();

  // Initialize webcam when in camera mode
  useEffect(() => {
    if (isOpen && mode === 'camera' && !previewUrl) {
      startCamera();
    } else {
      stopCamera();
    }

    // Capture user geolocation coordinates if available
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {}, // fallback if denied
      );
    }

    return () => stopCamera();
  }, [isOpen, mode, previewUrl]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError('Webcam access was denied or is unavailable. Switch to File Upload mode.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `wfh-clockin-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetPhoto = () => {
    setPhotoFile(null);
    setPreviewUrl(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setSubmitError('Please capture or upload a selfie photo to clock in.');
      return;
    }

    try {
      setSubmitError(null);
      await clockInMutation.mutateAsync({
        photoFile,
        workNotes,
        locationLatitude: location.lat,
        locationLongitude: location.lng,
      });

      onClose();
      resetPhoto();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit WFH clock-in.';
      setSubmitError(typeof msg === 'string' ? msg : msg[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WFH Attendance Clock-In" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('camera'); resetPhoto(); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'camera' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Webcam Capture
          </button>
          <button
            type="button"
            onClick={() => { setMode('upload'); resetPhoto(); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {/* Photo View / Camera Screen */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200">
          {previewUrl ? (
            <img src={previewUrl} alt="Captured WFH Selfie" className="w-full h-full object-cover" />
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
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer text-xs text-blue-400 font-semibold hover:underline">
                Choose a selfie photo file
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Action Controls for Photo Capture */}
        <div className="flex justify-between items-center">
          {previewUrl ? (
            <Button type="button" variant="outline" size="sm" onClick={resetPhoto} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retake Selfie
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

        {/* Work Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            WFH Work Notes / Today's Objectives
          </label>
          <textarea
            rows={3}
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            placeholder="Describe the tasks you are working on today from home..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            isLoading={clockInMutation.isPending}
            disabled={!photoFile}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Submit Clock-In
          </Button>
        </div>
      </form>
    </Modal>
  );
};
