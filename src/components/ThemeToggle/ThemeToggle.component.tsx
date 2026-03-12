'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { SunIcon } from './SunIcon.component';
import { MoonIcon } from './MoonIcon.component';
import { themeToggleStyles } from './ThemeToggle.styles';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const otherTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={themeToggleStyles.button}
      aria-label={mounted ? `Switch to ${otherTheme} theme` : 'Toggle theme'}
      onClick={() => setTheme(otherTheme)}
    >
      <SunIcon className={themeToggleStyles.sunIcon} />
      <MoonIcon className={themeToggleStyles.moonIcon} />
    </button>
  );
}
