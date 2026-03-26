'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FileUpload, Attachment } from '@/components/FileUpload';
import { AttachmentList } from '@/components/AttachmentList';

export default function NewCommentPage() {
  const router = useRouter();
  const params = useParams();
  const issueId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!content.trim()) {
      setError('Comment content is required');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create comment first
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create comment');
      }

      // 2. Link all attachments to the comment
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          await fetch('/api/attachments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attachmentId: attachment.id,
              commentId: data.data.id, // Use the comment ID from response
            }),
          });
        }
      }

      router.push(`/issues/${issueId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create comment');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/issues/${issueId}`)}
          >
            ← Back to Issue
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Textarea
                label="Comment"
                placeholder="Write your comment here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />

              {/* File Upload Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Attachments (Optional)
                </label>
                <FileUpload
                  onUploadComplete={(attachment) => {
                    setAttachments([...attachments, attachment]);
                  }}
                  onUploadError={(error) => {
                    console.error('Upload error:', error);
                  }}
                  disabled={isLoading}
                />

                {/* Show uploaded attachments */}
                {attachments.length > 0 && (
                  <AttachmentList
                    attachments={attachments}
                    canDelete={true}
                    onDelete={async (id) => {
                      // Delete from server
                      await fetch(`/api/attachments?id=${id}`, { method: 'DELETE' });
                      // Remove from state
                      setAttachments(attachments.filter((a) => a.id !== id));
                    }}
                    showUploader={false}
                  />
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" isLoading={isLoading}>
                  {isLoading ? 'Adding Comment...' : 'Add Comment'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
