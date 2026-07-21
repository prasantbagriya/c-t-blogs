import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync local state with document root .dark class
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkTheme();

    // Observe changes to document class
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    // Dispatch event to App.tsx (temporary change)
    window.dispatchEvent(new CustomEvent('app-theme-toggle', { detail: !isDark }));
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 "
      title="Toggle Dark Mode"
    >
      {!isDark ? (
        <Moon className="h-5 w-5 text-gray-700" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500" />
      )}
    </Button>
  );
}
