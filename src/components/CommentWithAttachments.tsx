'use client';

import { useEffect, useState } from 'react';
import { AttachmentList } from './AttachmentList';
import { Attachment } from './FileUpload';

interface CommentWithAttachmentsProps {
  commentId: string;
  content: string;
  user: {
    name: string;
    avatar_url: string;
  };
  created_at: string;
}

export function CommentWithAttachments({
  commentId,
  content,
  user,
  created_at,
}: CommentWithAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAttachments() {
      try {
        const response = await fetch(`/api/attachments?comment_id=${commentId}`);
        const data = await response.json();

        if (data.success && data.attachments) {
          setAttachments(data.attachments);
        }
      } catch (error) {
        console.error('Failed to fetch attachments:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttachments();
  }, [commentId]);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        {user.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900 dark:text-white">{user.name}</span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">•</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400" title={new Date(created_at).toLocaleString()}>
                {(() => {
                  const now = new Date();
                  const commentDate = new Date(created_at);
                  const diffMs = now.getTime() - commentDate.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return 'just now';
                  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                  return commentDate.toLocaleDateString();
                })()}
              </span>
            </div>
            <time className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
              {new Date(created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </time>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap mb-3">{content}</p>

          {/* Attachments */}
          {!isLoading && attachments.length > 0 && (
            <div className="mt-3">
              <AttachmentList
                attachments={attachments}
                canDelete={false}
                showUploader={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
