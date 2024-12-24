import { AppSidebar } from '../components/AppSideBar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '../components/ui/breadcrumb';
import { Separator } from '../components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { HandCoins, Plane } from 'lucide-react';
import TripForm from '../components/TripForm';
import TripList from '../components/TripList';
import { Toaster } from '../components/ui/sonner';
import GoogleMapComponent from '../components/GoogleMap';

export function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Trips</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-8">
            {/* Create Trip */}
            <div className="aspect-auto rounded-xl bg-muted/50 md:col-span-2 h-[15vh]">
              <div className="flex flex-col h-full items-center justify-center p-4">
                <Popover>
                  <PopoverTrigger>
                    <div className="flex flex-col items-center justify-center space-y-2 text-primary hover:text-primary/90 cursor-pointer transition-all">
                      <div className="flex items-center space-x-2">
                        <Plane className="h-6 w-6 transition-transform hover:scale-125" />
                        <p className="text-base font-medium hover:scale-105 transition-transform font-funneld font-voyago">
                          Create Trip
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Plan your next adventure!
                      </p>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px]">
                    <TripForm />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* Handle Budget */}
            <div className="aspect-auto rounded-xl bg-muted/50 md:col-span-2 h-[15vh]">
              <div className="flex flex-col h-full items-center justify-center p-4">
                <Popover>
                  <PopoverTrigger>
                    <div className="flex flex-col items-center justify-center space-y-2 text-primary hover:text-primary/90 cursor-pointer transition-all">
                      <div className="flex items-center space-x-2">
                        <HandCoins className="h-6 w-6 transition-transform hover:scale-125" />
                        <p className="text-base font-medium hover:scale-105 transition-transform font-funneld font-voyago">
                          Handle Budget
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Take control of your budget!
                      </p>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px]">
                    <TripForm />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-8">
            {/* Combined TripList and GoogleMap */}
            <div className="rounded-xl bg-muted/50 md:col-span-2 min-h-[40vh]">
              <TripList />
            </div>
            <div className="rounded-xl bg-muted/10 md:col-span-6 min-h-[40vh]">
              <GoogleMapComponent />
            </div>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
