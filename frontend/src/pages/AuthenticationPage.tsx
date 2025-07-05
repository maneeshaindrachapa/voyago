import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserAuthForm } from '../components/AuthForm';

export default function AuthenticationPage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar for large screens */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col bg-muted p-10 text-white dark:border-r relative">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img
            src="./icons/logo-dark.png"
            width={25}
            height={25}
            alt="Authentication"
            className="block dark:hidden"
          />
          <img
            src="./icons/logo-light.png"
            width={25}
            height={25}
            alt="Authentication"
            className="hidden dark:block"
          />
          &nbsp;Voyago
        </div>
      </div>

      {/* Main content for all screens */}
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
