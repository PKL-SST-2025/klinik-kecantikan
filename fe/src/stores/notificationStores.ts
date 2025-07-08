// notification.ts
import { createSignal } from "solid-js";

export type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
};

const [notifications, setNotifications] = createSignal<Notification[]>([
  
]);

// --- Optional Helper Functions ---
export const addNotification = (message: string) => {
  const newNotification: Notification = {
    id: Date.now(), // ID unik
    message,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };
  setNotifications((prev) => [newNotification, ...prev]);
};

export const markAllAsRead = () => {
  setNotifications((prev) =>
    prev.map((notif) => ({ ...notif, read: true }))
  );
};

export const unreadCount = () => notifications().filter(n => !n.read).length;

export { notifications, setNotifications };

export function removeNotificationByKeyword(keyword: string) {
  setNotifications((prev) => prev.filter((n) => !n.message.includes(keyword)));
}
