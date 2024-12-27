import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from 'lucide-react';

export const ThemeToggle = ({ isHideText }: { isHideText: boolean }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-1 rounded-full flex flex-row items-center"
    >
      {theme === 'dark' ? (
        <SunIcon className="w-3 h-3 text-yellow-500" />
      ) : (
        <MoonIcon className="w-3 h-3 text-gray-700" />
      )}
      {!isHideText && <p className=" ml-2  text-xs">Change Theme</p>}
    </button>
  );
};
