import { useTheme } from '../context/ThemeContext';
import { UserButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

export function UserNav() {
  const { theme } = useTheme();

  return (
    <UserButton
      afterSignOutUrl="/auth"
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        elements: {
          userButtonAvatarBox: 'h-6 w-6',
        },
      }}
    />
  );
}
