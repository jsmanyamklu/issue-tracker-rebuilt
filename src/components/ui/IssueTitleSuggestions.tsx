'use client';

import { useState, useEffect, useRef } from 'react';

interface Issue {
  id: string;
  title: string;
  type: 'bug' | 'feature' | 'task' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
  isCustom?: boolean;
}

interface IssueTitleSuggestionsProps {
  projectId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const CUSTOM_TITLES_KEY = 'custom_issue_titles';

export function IssueTitleSuggestions({
  projectId,
  value,
  onChange,
  placeholder = 'Enter issue title',
  required = false,
}: IssueTitleSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Issue[]>([]);
  const [customTitles, setCustomTitles] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load custom titles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${CUSTOM_TITLES_KEY}_${projectId}`);
    if (saved) {
      try {
        setCustomTitles(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load custom titles:', error);
      }
    }
  }, [projectId]);

  // Fetch recent issues when project changes
  useEffect(() => {
    if (!projectId) {
      setSuggestions([]);
      return;
    }

    async function fetchRecentIssues() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/issues?project_id=${projectId}&limit=10&sort=recent`);
        const data = await response.json();

        if (data.success && data.data) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch recent issues:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentIssues();
  }, [projectId]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Merge custom titles with suggestions
  const allSuggestions: Issue[] = [
    ...customTitles.map((title, index) => ({
      id: `custom-${index}`,
      title,
      type: 'task' as const,
      priority: 'medium' as const,
      status: 'custom',
      created_at: new Date().toISOString(),
      isCustom: true,
    })),
    ...suggestions,
  ];

  // Filter suggestions based on input
  const filteredSuggestions = allSuggestions.filter((issue) =>
    issue.title.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelectSuggestion = (title: string) => {
    onChange(title);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleAddAsNew = () => {
    if (!value.trim() || !projectId) return;

    // Check if already exists in custom titles
    if (customTitles.includes(value.trim())) {
      setShowSuggestions(false);
      return;
    }

    // Add to custom titles
    const updated = [...customTitles, value.trim()];
    setCustomTitles(updated);
    localStorage.setItem(`${CUSTOM_TITLES_KEY}_${projectId}`, JSON.stringify(updated));
    setShowSuggestions(false);
  };

  const typeIcons = {
    bug: '🐛',
    feature: '✨',
    task: '✅',
    improvement: '🔧',
  };

  const priorityColors = {
    low: 'text-neutral-500',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        Title {required && <span className="text-danger-600">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => projectId && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />

        {projectId && suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors"
            title="Show recent issues in this project"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && projectId && (
        <div className="absolute z-50 mt-2 w-full max-h-96 overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-soft-lg animate-scale-in">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              💡 Common Issues in This Project
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Click a title to use it, or add your own
            </p>
          </div>

          {filteredSuggestions.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredSuggestions.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(issue.title)}
                  className="w-full p-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {issue.isCustom ? (
                      <span className="text-xl flex-shrink-0 mt-0.5">⭐</span>
                    ) : (
                      <span className="text-xl flex-shrink-0 mt-0.5">
                        {typeIcons[issue.type]}
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      {issue.isCustom ? (
                        <div className="mb-1">
                          <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase">
                            Custom
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase ${priorityColors[issue.priority]}`}>
                            {issue.priority}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <h5 className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 line-clamp-2">
                        {issue.title}
                      </h5>
                    </div>

                    <svg
                      className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 flex-shrink-0 mt-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                No matching issues found
              </p>
            </div>
          )}

          {/* Add as New Button */}
          {value.trim() && !filteredSuggestions.some(s => s.title === value.trim()) && (
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <button
                type="button"
                onClick={handleAddAsNew}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                ➕ Add "{value.trim()}" as New Issue Title
              </button>
            </div>
          )}

          {filteredSuggestions.length > 0 && allSuggestions.length > filteredSuggestions.length && (
            <div className="p-2 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
              Showing {filteredSuggestions.length} of {allSuggestions.length} issues
            </div>
          )}
        </div>
      )}

    </div>
  );
}
