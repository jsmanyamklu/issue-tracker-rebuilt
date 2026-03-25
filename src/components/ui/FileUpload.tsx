'use client';

import { useState, useRef } from 'react';
import { formatFileSize, getFileIcon } from '@/lib/fileUpload';
import { useToast } from '@/contexts/ToastContext';
import { Button } from './Button';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

interface FileUploadProps {
  onUpload?: (file: UploadedFile) => void;
  onDelete?: (fileId: string) => void;
  existingFiles?: UploadedFile[];
  maxFiles?: number;
  accept?: string;
}

export function FileUpload({
  onUpload,
  onDelete,
  existingFiles = [],
  maxFiles = 5,
  accept = 'image/*,.pdf,.txt,.json',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (files.length + fileList.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(fileList).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Upload failed');
        }

        return res.json();
      });

      const results = await Promise.all(uploadPromises);
      const uploadedFiles = results.map((r) => r.data);

      setFiles([...files, ...uploadedFiles]);
      uploadedFiles.forEach((file) => onUpload?.(file));

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      const res = await fetch(`/api/upload/${file.filename}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(files.filter((f) => f.id !== fileId));
      onDelete?.(fileId);
      toast.success('File deleted');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors cursor-pointer
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {uploading ? (
            <p className="text-sm text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF, TXT up to 10MB ({files.length}/{maxFiles} files)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded Files</p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.mimetype.startsWith('image/') && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View
                  </a>
                )}
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
