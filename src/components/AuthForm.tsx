import { SignUp, SignIn } from '@clerk/clerk-react';
import * as React from 'react';

import { cn } from '../lib/utils';

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isSignUp, setIsSignUp] = React.useState(true);

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-4">
        {isSignUp ? <SignUp /> : <SignIn />}
      </div>
    </div>
  );
}
