import { storageService } from './storage.service';
import { notificationsList } from '@/data/routesData';

const STORAGE_KEY = storageService.KEYS.NOTIFICATIONS || 'dental_crm_notifications';

export const notificationsService = {
  getNotifications() {
    const saved = storageService.get(STORAGE_KEY);
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      storageService.set(STORAGE_KEY, notificationsList);
      return notificationsList;
    }
    const savedMap = new Map(saved.map((n) => [n.id, n]));
    const merged = notificationsList.map((n) => {
      const existing = savedMap.get(n.id);
      return existing ? { ...n, read: existing.read ?? n.read } : n;
    });
    const seedIds = new Set(notificationsList.map((n) => n.id));
    saved.forEach((s) => {
      if (!seedIds.has(s.id)) merged.push(s);
    });
    storageService.set(STORAGE_KEY, merged);
    return merged;
  },

  markAsRead(id) {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    storageService.set(STORAGE_KEY, updated);
    return updated;
  },

  toggleRead(id) {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
    storageService.set(STORAGE_KEY, updated);
    return updated;
  },

  markAllAsRead() {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    storageService.set(STORAGE_KEY, updated);
    return updated;
  },

  resetNotifications() {
    storageService.set(STORAGE_KEY, notificationsList);
    return notificationsList;
  },
};
