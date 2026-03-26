'use client';

import { useState } from 'react';
import { FileUpload, Attachment } from '@/components/FileUpload';
import { AttachmentList } from '@/components/AttachmentList';

export default function TestUploadPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleUploadComplete = (attachment: Attachment) => {
    console.log('Upload complete:', attachment);
    addLog(`✅ File uploaded: ${attachment.original_filename} (${attachment.file_size} bytes)`);
    setAttachments([...attachments, attachment]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    addLog(`❌ Upload error: ${error}`);
  };

  const handleDelete = async (id: string) => {
    addLog(`🗑️ Deleting attachment: ${id}`);
    try {
      const response = await fetch(`/api/attachments?id=${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setAttachments(attachments.filter((a) => a.id !== id));
        addLog(`✅ Deleted successfully`);
      } else {
        addLog(`❌ Delete failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Delete error: ${error}`);
    }
  };

  const clearLog = () => setTestLog([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-accent-700 dark:from-white dark:via-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
            📎 File Upload Test
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-lg">
            Test the file upload feature prototype
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>📤</span>
              <span className="bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                Upload Files
              </span>
            </h2>

            <div className="space-y-4">
              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Supported Files:
                </h3>
                <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>🖼️ Images: JPEG, PNG, GIF, WebP</li>
                  <li>📄 Documents: PDF, Word, Excel, PowerPoint</li>
                  <li>📃 Text: TXT, CSV, Markdown</li>
                  <li>⚙️ Max size: 10MB</li>
                </ul>
              </div>

              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                maxSizeMB={10}
              />

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Upload Statistics
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                    <div className="text-primary-600 dark:text-primary-400 font-bold text-2xl">
                      {attachments.length}
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-xs">
                      Files Uploaded
                    </div>
                  </div>
                  <div className="bg-success-50 dark:bg-success-900/20 p-3 rounded-lg">
                    <div className="text-success-600 dark:text-success-400 font-bold text-2xl">
                      {(attachments.reduce((sum, a) => sum + a.file_size, 0) / 1024 / 1024).toFixed(2)}
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-xs">
                      Total MB
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 animate-fade-in animation-delay-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>📋</span>
                <span className="bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                  Activity Log
                </span>
              </h2>
              <button
                onClick={clearLog}
                className="text-xs text-neutral-500 hover:text-danger-600 dark:text-neutral-400 dark:hover:text-danger-400 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="bg-neutral-900 dark:bg-black rounded-lg p-4 h-80 overflow-y-auto custom-scrollbar font-mono text-xs">
              {testLog.length === 0 ? (
                <div className="text-neutral-500 italic">No activity yet...</div>
              ) : (
                <div className="space-y-1">
                  {testLog.map((log, i) => (
                    <div key={i} className="text-neutral-300 dark:text-neutral-400">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        {attachments.length > 0 && (
          <div className="mt-6 bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 animate-fade-in">
            <AttachmentList
              attachments={attachments}
              canDelete={true}
              onDelete={handleDelete}
              showUploader={false}
            />
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 animate-fade-in animation-delay-200">
          <h3 className="text-sm font-bold text-primary-900 dark:text-primary-200 mb-2">
            💡 Testing Tips
          </h3>
          <ul className="text-sm text-primary-800 dark:text-primary-300 space-y-1">
            <li>• Try uploading different file types (images, PDFs, docs)</li>
            <li>• Test file size validation (try a file over 10MB)</li>
            <li>• Check image preview functionality</li>
            <li>• Test download and delete buttons</li>
            <li>• Check the activity log for errors</li>
            <li>• Files are stored in <code className="bg-primary-100 dark:bg-primary-900/40 px-1 rounded">public/uploads/</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
