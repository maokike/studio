"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellDot, PlusCircle, Trash2, Eye } from "lucide-react";
import { NotificationForm } from "./notification-form";
import type { NotificationFormValues } from "./notification-form"; // Import the form values type
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetRoles: Array<"patient" | "doctor" | "admin">;
  sentAt: string; // ISO Date string
  read: boolean;
}

const MOCK_NOTIFICATIONS_DATA: NotificationItem[] = [
  { id: "notif_1", title: "Welcome New Doctors!", message: "We are pleased to welcome Dr. Smith and Dr. Jones to our team. Please make them feel at home.", targetRoles: ["doctor", "admin"], sentAt: new Date(Date.now() - 1 * 24*60*60*1000).toISOString(), read: false },
  { id: "notif_2", title: "System Maintenance Scheduled", message: "There will be a scheduled system maintenance on 2023-12-25 from 02:00 to 04:00 AM. Services might be temporarily unavailable.", targetRoles: ["patient", "doctor", "admin"], sentAt: new Date(Date.now() - 3 * 24*60*60*1000).toISOString(), read: true },
  { id: "notif_3", title: "Flu Shot Campaign", message: "Our annual flu shot campaign is starting next week. Encourage your patients to get vaccinated.", targetRoles: ["doctor"], sentAt: new Date(Date.now() - 7 * 24*60*60*1000).toISOString(), read: true },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS_DATA);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<NotificationItem | null>(null);

  const { toast } = useToast();

  const handleCreateNotification = () => {
    setIsFormOpen(true);
  };

  const handleSendNotification = (data: NotificationFormValues) => {
    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: data.title,
      message: data.message,
      targetRoles: data.targetRoles,
      sentAt: new Date().toISOString(),
      read: false, // New notifications are unread
    };
    setNotifications([newNotification, ...notifications]);
  };

  const handleViewNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    // Mark as read
    setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n));
  };
  
  const handleDeleteNotification = (notification: NotificationItem) => {
    setNotificationToDelete(notification);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNotification = () => {
    if (notificationToDelete) {
      setNotifications(notifications.filter(n => n.id !== notificationToDelete.id));
      toast({
        title: "Notification Deleted",
        description: `Notification "${notificationToDelete.title}" has been deleted.`,
      });
      setNotificationToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const getRoleBadgeVariant = (role: "patient" | "doctor" | "admin") => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      case 'patient': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <>
      <PageHeader title="Notification System" description="Manage and send notifications to users.">
        <Button onClick={handleCreateNotification}>
          <PlusCircle className="mr-2 h-4 w-4" /> Compose Notification
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card key={notification.id} className={cn("shadow-md hover:shadow-lg transition-shadow", !notification.read && "border-primary border-2")}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline flex items-center">
                      {!notification.read && <BellDot className="h-5 w-5 mr-2 text-primary animate-pulse" />}
                      {notification.title}
                    </CardTitle>
                    <CardDescription>Sent on: {new Date(notification.sentAt).toLocaleString()}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(notification)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4"/>
                    <span className="sr-only">Delete notification</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground line-clamp-2">{notification.message}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {notification.targetRoles.map(role => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)} className="capitalize text-xs">{role}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => handleViewNotification(notification)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <BellDot className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No Notifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no notifications to display. Try sending one!
            </p>
          </div>
        )}
      </div>

      <NotificationForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSend={handleSendNotification}
      />

      {selectedNotification && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">{selectedNotification.title}</DialogTitle>
              <DialogDescription>
                Sent on: {new Date(selectedNotification.sentAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-6">
              <div className="prose prose-sm dark:prose-invert max-w-none py-4 whitespace-pre-wrap">
                {selectedNotification.message}
              </div>
            </ScrollArea>
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Targeted Roles:</p>
              <div className="flex flex-wrap gap-1">
                {selectedNotification.targetRoles.map(role => (
                  <Badge key={role} variant={getRoleBadgeVariant(role)} className="capitalize text-xs">{role}</Badge>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notification titled "{notificationToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNotification} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
