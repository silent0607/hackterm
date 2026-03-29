import { useEffect, useState, useCallback } from 'react';

export function useGlobalShortcuts(onNavigate) {
  const [shortcuts, setShortcuts] = useState({});

  const refreshShortcuts = useCallback(async () => {
    try {
      const res = await fetch('/api/shortcuts');
      if (res.ok) {
        const data = await res.json();
        setShortcuts(data);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    refreshShortcuts();
  }, [refreshShortcuts]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Input alanındayken kısayolları görmezden gel
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || 
                      document.activeElement.contentEditable === 'true';
      
      // Xterm.js içindeyken terminalin kendi kısayolları çalışmalı
      const isTerminal = document.activeElement.classList.contains('xterm-helper-textarea');
      
      if (isInput || isTerminal) return;

      for (const [toolId, shortcutStr] of Object.entries(shortcuts)) {
        if (!shortcutStr) continue;
        
        const parts = shortcutStr.toLowerCase().split('+');
        const needsCtrl = parts.includes('ctrl');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');
        const key = parts[parts.length - 1];

        const hasCtrl = e.ctrlKey || e.metaKey;
        const hasShift = e.shiftKey;
        const hasAlt = e.altKey;
        const actualKey = e.key.toLowerCase();

        if (
          hasCtrl === needsCtrl &&
          hasShift === needsShift &&
          hasAlt === needsAlt &&
          actualKey === key
        ) {
          e.preventDefault();
          onNavigate(toolId);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, onNavigate]);

  return { shortcuts, refreshShortcuts };
}
