import { apiRequest, ApiResponse } from "@/lib/api-client";

export interface AppNotification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'appointment_booked' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_completed' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  /**
   * Fetch notifications for current user
   */
  static async getNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    try {
      const res = await apiRequest<{ notifications: AppNotification[]; unreadCount: number }>('/notifications');
      return {
        notifications: (res.data as any) || [],
        unreadCount: (res as any).unreadCount || 0,
      };
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return { notifications: [], unreadCount: 0 };
    }
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(id: string): Promise<boolean> {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      await apiRequest('/notifications/read-all', { method: 'PUT' });
      return true;
    } catch {
      return false;
    }
  }
}
