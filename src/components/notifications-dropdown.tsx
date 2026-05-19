import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ArrowRightLeft, Undo2, AlertTriangle, Wrench, CheckCircle } from "lucide-react";
import { recentActivity } from "@/lib/mock-data";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(recentActivity);
  const [unread, setUnread] = useState(recentActivity.length);
  const [open, setOpen] = useState(false);

  const handleOpen = (val: boolean) => {
    setOpen(val);
    if (val) {
      // Mark all as read when opening
      setUnread(0);
    }
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
          <span className="text-xs text-muted-foreground">{notifications.length} recent</span>
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((activity) => (
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
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <button 
              onClick={() => { setNotifications([]); setUnread(0); }}
              className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
              Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
