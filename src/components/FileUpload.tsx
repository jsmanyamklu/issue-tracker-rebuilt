'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface FileUploadProps {
  onUploadComplete: (attachment: Attachment) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_url: string;
  created_at: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxSizeMB = 10,
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setError('');
    setUploadProgress(0);

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `File too large. Maximum size is ${maxSizeMB}MB`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (data.success && data.attachment) {
        onUploadComplete(data.attachment);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorMsg = data.error || 'Upload failed';
        setError(errorMsg);
        if (onUploadError) onUploadError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Upload failed. Please try again.';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        disabled={isUploading || disabled}
        className="hidden"
        id="file-upload-input"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.md"
      />

      <Button
        type="button"
        onClick={handleFileSelect}
        variant="secondary"
        size="sm"
        disabled={isUploading || disabled}
        className="relative overflow-hidden"
      >
        {isUploading ? (
          <>
            <span className="animate-pulse">📤 Uploading...</span>
            {uploadProgress > 0 && (
              <span className="ml-2 text-xs">({uploadProgress}%)</span>
            )}
          </>
        ) : (
          <>
            <span>📎 Attach File</span>
          </>
        )}
      </Button>

      {/* Progress Bar */}
      {isUploading && uploadProgress > 0 && (
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {/* Help Text */}
      {!isUploading && !error && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Max {maxSizeMB}MB • Images, PDFs, docs
        </p>
      )}
    </div>
  );
}
