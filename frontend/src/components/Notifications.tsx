import React from 'react';
import { Bell, CircleCheck, CircleX, Mountain } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Button } from './ui/button';
import { useNotificationContext } from '../context/NotificationContext';
import { formatDate } from '../lib/common-utils';
import { useUserContext } from '../context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Notifications = () => {
  const { notifications, markNotificationAsRead } = useNotificationContext();
  const { users } = useUserContext();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative focus:outline-none">
            <Bell className="h-4 w-4 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4 bg-muted border rounded-md shadow-md">
          <h3 className="text-sm font-semibold mb-2">Notifications</h3>
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="py-2 text-center text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex flex-col py-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    {notification.trip_id ? (
                      <Mountain className="h-5 w-5" />
                    ) : (
                      <Mountain className="h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-voyago">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex flex-col">
                        <Button
                          size="sm"
                          variant="link"
                          className="text-xs text-green-500 hover:underline"
                          onClick={() =>
                            markNotificationAsRead(notification, true)
                          }
                        >
                          <CircleCheck className="text-green-500 h-4 w-4 " />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="link"
                          className="text-xs text-red-500 hover:underline"
                          onClick={() =>
                            markNotificationAsRead(notification, false)
                          }
                        >
                          <CircleX className=" text-red-500 h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                  {notification.trips && (
                    <div className="flex items-center gap-4 p-2">
                      <Avatar className="flex-shrink-0">
                        <AvatarImage
                          src={
                            users?.find(
                              (u) => u.id === notification.trips?.ownerid
                            )?.imageUrl || ''
                          }
                        />
                        <AvatarFallback>
                          {users
                            ?.find((u) => u.id === notification.trips?.ownerid)
                            ?.firstName?.charAt(0)}{' '}
                          {users
                            ?.find((u) => u.id === notification.trips?.ownerid)
                            ?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-xs text-gray-500">
                        <p>
                          <strong>Trip Name:</strong>{' '}
                          {notification.trips?.tripname}
                        </p>
                        <p>
                          <strong>Country:</strong>{' '}
                          {notification.trips?.country}
                        </p>
                        <p>
                          <strong>Date Range:</strong>{' '}
                          {formatDate(notification.trips?.daterange.from)} -{' '}
                          {formatDate(notification.trips?.daterange?.to)}
                        </p>
                        <p>
                          <strong>Invited by:</strong>{' '}
                          {
                            users?.find(
                              (u) => u.id === notification.trips?.ownerid
                            )?.firstName
                          }{' '}
                          {users?.find(
                            (u) => u.id === notification.trips?.ownerid
                          )?.lastName || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Notifications;
