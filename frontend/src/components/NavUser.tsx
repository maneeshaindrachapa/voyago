import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import { dark } from '@clerk/themes';
import React from 'react';

export function NavUser() {
  const { theme } = useTheme();
  const { user } = useUser();
  const { isMobile } = useSidebar();

  if (!user) return null;

  const userName = user.fullName || 'Guest';
  const userEmail = user.primaryEmailAddress?.emailAddress || 'No email';

  const handleContainerClick = (e: React.MouseEvent) => {
    const button = e.currentTarget.querySelector('button');
    if (button) {
      button.click();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={handleContainerClick}
        >
          <UserButton
            afterSignOutUrl="/auth"
            appearance={{
              baseTheme: theme === 'dark' ? dark : undefined,
              elements: {
                userButtonAvatarBox: 'h-8 w-8',
              },
            }}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{userName}</span>
            <span className="truncate text-xs">{userEmail}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
