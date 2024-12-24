import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserAuthForm } from '../components/AuthForm';

export default function AuthenticationPage() {
  const { isSignedIn } = useUser(); // Get authentication state
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
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
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <UserAuthForm />
          </div>
        </div>
      </div>
    </>
  );
}
