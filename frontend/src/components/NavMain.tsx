import { ListChecks, SquareTerminal } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSubButton,
} from './ui/sidebar';
import { ThemeToggle } from './ThemeToggle';
import { TripItineraryPrint } from './TripItenaryPrint';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { useTripContext } from '../context/TripContext';

export function NavMain() {
  const { selectedTrip } = useTripContext();
  // This is sample data.
  const data = {
    navMain: [
      {
        title: 'Playground',
        url: '#',
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: 'History',
            url: '#',
          },
          {
            title: 'Starred',
            url: '#',
          },
          {
            title: 'Settings',
            url: '#',
          },
        ],
      },
    ],
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuSubButton>
            <ThemeToggle isHideText={false} />
          </SidebarMenuSubButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          {selectedTrip && (
            <SidebarMenuSubButton>
              <Dialog>
                <DialogTrigger className="flex flex-row justify-start text-xs">
                  <ListChecks className="w-4 h-4 mr-2" />
                  Print Trip Itenary -{selectedTrip.tripname}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="mb-2">
                      Do you want to print itenary for - {selectedTrip.tripname}{' '}
                    </DialogTitle>
                    <DialogDescription>
                      <TripItineraryPrint />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </SidebarMenuSubButton>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
      {/* <SidebarMenu>
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu> */}
    </SidebarGroup>
  );
}
