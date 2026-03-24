'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  requiresAuth?: boolean;
  combo?: string; // For multi-key combos like "g d"
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, onShowHelp } = options;
  const router = useRouter();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (except for combos we explicitly handle)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      // Single key shortcuts
      switch (key) {
        case 'c':
          event.preventDefault();
          router.push('/issues/new');
          break;

        case '/':
          event.preventDefault();
          // Focus search input when it exists
          const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
          if (searchInput) {
            searchInput.focus();
          }
          break;

        case '?':
          event.preventDefault();
          onShowHelp?.();
          break;
      }
    },
    [router, onShowHelp]
  );

  // Handle "g" key combo shortcuts (like GitHub)
  useEffect(() => {
    if (!enabled) return;

    let gPressed = false;
    let gPressedTime = 0;

    const handleComboKey = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if modifier keys are pressed
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const now = Date.now();

      // If 'g' is pressed, mark it and wait for next key
      if (key === 'g' && !gPressed) {
        event.preventDefault();
        gPressed = true;
        gPressedTime = now;

        // Reset after 1 second if no second key
        setTimeout(() => {
          if (gPressed && Date.now() - gPressedTime > 1000) {
            gPressed = false;
          }
        }, 1000);
        return;
      }

      // If we're in "g" mode and get another key within 1 second
      if (gPressed && now - gPressedTime < 1000) {
        event.preventDefault();
        gPressed = false;

        switch (key) {
          case 'd':
            router.push('/dashboard');
            break;
          case 'p':
            router.push('/projects');
            break;
          case 'i':
            router.push('/my-issues');
            break;
          case 'h':
            router.push('/');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keydown', handleComboKey);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keydown', handleComboKey);
    };
  }, [enabled, handleKeyPress, router]);

  return null;
}
