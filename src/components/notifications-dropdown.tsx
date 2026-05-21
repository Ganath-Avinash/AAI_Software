import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, ArrowRightLeft, Undo2, AlertTriangle, Wrench, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchHistory } from "@/lib/api";

export function NotificationsDropdown() {
  const { data: history = [], isLoading } = useQuery({ queryKey: ['history'], queryFn: fetchHistory });
  const [open, setOpen] = useState(false);
  const [lastReadId, setLastReadId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lastReadNotificationId');
      if (saved) {
        setLastReadId(parseInt(saved, 10));
      }
    }
  }, []);

  const notifications = useMemo(() => {
    return history.map((h: any) => ({
      id: h.id,
      type: h.status === 'Assigned' ? 'assign' : h.status === 'Returned' ? 'withdraw' : 'create',
      text: h.status === 'Assigned' 
        ? `${h.assetId} assigned to ${h.user || 'User'}`
        : h.status === 'Returned'
        ? `${h.assetId} returned from ${h.user || 'User'}`
        : `${h.assetId} - ${h.status}`,
      time: h.status === 'Assigned' ? h.assignedDate : h.returnedDate || h.assignedDate
    }));
  }, [history]);

  // Filter to only show unread notifications in the list
  const unreadNotifications = useMemo(() => {
    if (!notifications.length) return [];
    if (lastReadId === null) return notifications;
    return notifications.filter((n: any) => n.id > lastReadId);
  }, [notifications, lastReadId]);

  const unread = unreadNotifications.length;

  const markAsRead = () => {
    if (notifications.length > 0) {
      const topId = notifications[0].id;
      setLastReadId(topId);
      localStorage.setItem('lastReadNotificationId', topId.toString());
    }
  };

  const handleOpen = (val: boolean) => {
    setOpen(val);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="size-9 grid place-items-center rounded-md hover:bg-accent relative outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <span className="text-xs text-muted-foreground">{unread} unread</span>
        </div>
        
        {/* Replaced ScrollArea with a native div for reliable scrolling */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : unreadNotifications.length > 0 ? (
            <div className="divide-y">
              {unreadNotifications.map((activity: any) => (
                <div key={activity.id} className="p-4 flex gap-3 hover:bg-muted/50 transition-colors">
                  <div className="size-8 shrink-0 rounded-full bg-accent grid place-items-center mt-0.5">
                    {activity.type === "assign" ? (
                      <ArrowRightLeft className="size-3.5" />
                    ) : activity.type === "withdraw" ? (
                      <Undo2 className="size-3.5" />
                    ) : activity.type === "warranty" ? (
                      <AlertTriangle className="size-3.5 text-[hsl(var(--warning))]" />
                    ) : activity.type === "create" ? (
                      <CheckCircle className="size-3.5 text-[hsl(var(--success))]" />
                    ) : (
                      <Wrench className="size-3.5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm leading-tight">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You're all caught up!
            </div>
          )}
        </div>
        
        {unreadNotifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <button 
              onClick={(e) => { 
                e.preventDefault();
                markAsRead(); 
                // Keep dropdown open but it will show "You're all caught up!"
              }}
              className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
              Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
