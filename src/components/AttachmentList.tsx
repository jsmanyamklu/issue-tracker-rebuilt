'use client';

import { useState } from 'react';
import { Attachment } from './FileUpload';
import { formatFileSize, getFileIcon, isImage } from '@/lib/attachmentUtils';

interface AttachmentWithUploader extends Attachment {
  uploaded_by?: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

interface AttachmentListProps {
  attachments: AttachmentWithUploader[];
  canDelete?: boolean;
  onDelete?: (id: string) => Promise<void>;
  showUploader?: boolean;
}

export function AttachmentList({
  attachments,
  canDelete = false,
  onDelete,
  showUploader = true,
}: AttachmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    const confirmed = confirm('Are you sure you want to delete this attachment?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete attachment');
    } finally {
      setDeletingId(null);
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
        <span>📎</span>
        <span>Attachments ({attachments.length})</span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attachments.map((attachment) => {
          const isImg = isImage(attachment.mime_type);

          return (
            <div
              key={attachment.id}
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 hover:shadow-md transition-all duration-200 bg-white dark:bg-neutral-800"
            >
              {/* Preview */}
              {isImg ? (
                <a
                  href={attachment.storage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-2"
                >
                  <img
                    src={attachment.storage_url}
                    alt={attachment.original_filename}
                    className="w-full h-32 object-cover rounded hover:opacity-90 transition-opacity"
                  />
                </a>
              ) : (
                <div className="mb-2 flex items-center justify-center h-20 bg-neutral-100 dark:bg-neutral-700 rounded">
                  <span className="text-4xl">
                    {getFileIcon(attachment.mime_type)}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={attachment.storage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={attachment.original_filename}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate block"
                    title={attachment.original_filename}
                  >
                    {attachment.original_filename}
                  </a>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {formatFileSize(attachment.file_size)}
                  </p>

                  {showUploader && attachment.uploaded_by && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      by {attachment.uploaded_by.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Download */}
                  <a
                    href={attachment.storage_url}
                    download={attachment.original_filename}
                    className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                    title="Download"
                  >
                    <span className="text-lg">⬇️</span>
                  </a>

                  {/* Delete */}
                  {canDelete && onDelete && (
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      disabled={deletingId === attachment.id}
                      className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deletingId === attachment.id ? (
                        <span className="text-sm animate-pulse">⏳</span>
                      ) : (
                        <span className="text-lg">🗑️</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
