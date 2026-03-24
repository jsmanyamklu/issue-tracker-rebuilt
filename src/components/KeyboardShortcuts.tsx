'use client';

import { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useKeyboardShortcuts({
    enabled: true,
    onShowHelp: () => setShowHelp(true),
  });

  return (
    <KeyboardShortcutsHelp
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
    />
  );
}
