import { SignUp, SignIn } from '@clerk/clerk-react';
import * as React from 'react';

import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { dark } from '@clerk/themes';

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isSignUp, setIsSignUp] = React.useState(true);
  const { theme } = useTheme();

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-4">
        {isSignUp ? (
          <SignUp
            appearance={{
              baseTheme: theme === 'dark' ? dark : undefined,
            }}
          />
        ) : (
          <SignIn
            appearance={{
              baseTheme: theme === 'dark' ? dark : undefined,
            }}
          />
        )}
      </div>
    </div>
  );
}
