import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "due_date" | "budget_exceeded" | "goal_achieved" | "info";
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export function useNotificationsStore() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setNotifications(
          data.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type as Notification["type"],
            read: n.read,
            actionUrl: n.action_url || undefined,
            metadata: (n.metadata as Record<string, any>) || undefined,
            createdAt: new Date(n.created_at),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type,
            read: payload.new.read,
            actionUrl: payload.new.action_url || undefined,
            metadata: payload.new.metadata || undefined,
            createdAt: new Date(payload.new.created_at),
          };

          setNotifications((prev) => [newNotification, ...prev]);

          // Show browser notification
          showBrowserNotification(newNotification);

          // Show toast
          toast(newNotification.title, {
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showBrowserNotification = (notification: Notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Notificações ativadas!");
      } else if (permission === "denied") {
        toast.error("Notificações bloqueadas pelo navegador");
      }
      return permission;
    }
    return "denied";
  };

  const addNotification = async (
    title: string,
    message: string,
    type: Notification["type"],
    actionUrl?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: user.id,
            title,
            message,
            type,
            action_url: actionUrl || null,
            metadata: metadata || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error adding notification:", error);
      toast.error("Erro ao criar notificação");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Todas notificações marcadas como lidas");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Erro ao marcar notificações");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Erro ao excluir notificação");
    }
  };

  const clearAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setNotifications([]);
      toast.success("Todas notificações excluídas");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Erro ao limpar notificações");
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestNotificationPermission,
  };
}
