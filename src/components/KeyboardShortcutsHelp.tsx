'use client';

import { useEffect } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts: Shortcut[] = [
  {
    keys: ['c'],
    description: 'Create new issue',
    category: 'Actions',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
    category: 'Actions',
  },
  {
    keys: ['/'],
    description: 'Focus search',
    category: 'Actions',
  },
  {
    keys: ['g', 'd'],
    description: 'Go to Dashboard',
    category: 'Navigation',
  },
  {
    keys: ['g', 'p'],
    description: 'Go to Projects',
    category: 'Navigation',
  },
  {
    keys: ['g', 'i'],
    description: 'Go to My Issues',
    category: 'Navigation',
  },
  {
    keys: ['g', 'h'],
    description: 'Go to Home',
    category: 'Navigation',
  },
  {
    keys: ['Esc'],
    description: 'Close modals',
    category: 'General',
  },
];

const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {categories.map((category) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts
                    .filter((s) => s.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm text-gray-700">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center">
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-gray-400 text-xs">
                                  then
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-600 text-center">
              Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-sm">?</kbd> anytime to view shortcuts
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
