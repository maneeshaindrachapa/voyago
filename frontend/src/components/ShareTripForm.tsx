import React, { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerTrigger,
} from './ui/drawer';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useUserContext } from '../context/UserContext';
import { Share } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useUser } from '@clerk/clerk-react';
import { TripResponse } from '../context/TripContext';

import { toast } from 'sonner';
import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import {
  addNotificationsForTripShare,
  fetchNotificationsByTrip,
} from '../lib/notification-service';

const ShareTripForm = ({ trip }: { trip: TripResponse }) => {
  const { users, loading, error } = useUserContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [preSelectedUsers, setPreSelectedUsers] = useState<string[]>([]);
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchPreSelectedUsers = async () => {
      try {
        const sharedUsers = await fetchNotificationsByTrip(supabase, trip.id);
        const sharedUserIds = sharedUsers.map((u) => u.user_id);
        setPreSelectedUsers(sharedUserIds);
        setSelectedUsers(sharedUserIds);
      } catch (err) {
        console.error('Error fetching shared users:', err);
      }
    };

    fetchPreSelectedUsers();
  }, [trip.id]);

  const filteredUsers = users?.filter(
    (user_) =>
      user_.id !== user?.id &&
      (user_.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user_.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user_.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleUserSelection = (userId: string) => {
    if (preSelectedUsers.includes(userId)) return;

    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Send notification for trip share
  const handleShareTripWithUsers = async (
    userIds: string[],
    trip: TripResponse
  ) => {
    const message = `You have been invited to join a trip-${trip.tripname}`;
    const result = await addNotificationsForTripShare(
      supabase,
      userIds,
      trip.id,
      message
    );

    if (result.success) {
      toast.success('Shared trip successfully!');
      console.log('Shared trip successfully!');
      setOpen(false);
    } else {
      toast.error('Failed to share trip');
      console.error('Failed to share trip', result.error);
      setOpen(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Share className="h-3 w-3" />
      </DrawerTrigger>
      <DrawerContent className="mx-auto h-sm max-h-sm max-w-sm justify-center">
        <DrawerHeader>
          <DrawerTitle>
            <span className="font-voyago">{trip.tripname}</span>
          </DrawerTitle>
          <DrawerDescription>
            Select friends to share the trip with
          </DrawerDescription>
          <DrawerClose />
        </DrawerHeader>
        <div className="p-4 pt-0">
          {/* Search Field */}
          <Input
            placeholder="Search users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* User List */}
          {loading && (
            <div className="flex flex-col space-y-3 p-2">
              <Skeleton className="h-[10vh] w-full rounded-xl" />
              <Skeleton className="h-[10vh] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-[10vh] w-full rounded-xl" />
            </div>
          )}
          {!loading && users && (
            <ul className="space-y-2 mt-4">
              {filteredUsers?.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-row items-center justify-between"
                >
                  <div className="flex flex-row">
                    <Avatar className="mr-2 ">
                      <AvatarImage src={user.imageUrl || ''} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-center ">
                      <p className="font-medium text-xs text-left">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-gray-500 text-xs text-left">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      selectedUsers.includes(user.id) ? 'default' : 'outline'
                    }
                    onClick={() => toggleUserSelection(user.id)}
                    disabled={preSelectedUsers.includes(user.id)}
                  >
                    {preSelectedUsers.includes(user.id)
                      ? 'Shared'
                      : selectedUsers.includes(user.id)
                        ? 'Selected'
                        : 'Select'}
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Selected Users:</h3>
              <ul className="list-disc pl-4 text-sm flex flex-row">
                {selectedUsers.map((userId) => {
                  const user = users?.find((u) => u.id === userId);
                  return (
                    <li
                      key={userId}
                      className="flex  items-center justify-between"
                    >
                      <Avatar className="mr-1">
                        <AvatarImage src={user?.imageUrl || ''} />
                        <AvatarFallback>
                          {user?.firstName?.charAt(0)}
                          {user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Share Button */}
          <Button
            className="w-full mt-4"
            onClick={() => {
              const selectedUserIds = selectedUsers
                .map((userId) => {
                  const user = users?.find((u) => u.id === userId);
                  return user?.id;
                })
                .filter((id): id is string => id !== undefined);
              handleShareTripWithUsers(selectedUserIds, trip);
            }}
            disabled={
              selectedUsers.filter(
                (userId) => !preSelectedUsers.includes(userId)
              ).length === 0
            }
          >
            Share Trip
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ShareTripForm;
