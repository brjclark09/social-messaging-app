import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://localhost:8888';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');

    if (token && !config.url.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const authHeader = response.headers.authorization || response.headers.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        await AsyncStorage.setItem('authToken', token);

        return { success: true, token, data: response.data };
      } else {
        throw new Error('No authorization token received');
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  },

  logout: async (userId) => {
    try {
      if (userId) {
        await activityService.logActivity(userId, 'logout', 'User logged out');
      }

      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');

      return { success: true };
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      return { success: true };
    }
  },
};

export const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
      };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user',
      };
    }
  },

  createUser: async (userData, currentUserId) => {
    try {
      const response = await api.post('/users/', userData);

      if (currentUserId) {
        try {
          await activityService.logActivity(
            currentUserId,
            'user_create',
            `Created user: ${userData.email}`
          );
        } catch {
          // silent
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      }

      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create user',
      };
    }
  },

  updateUser: async (userId, userData, currentUserId) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);

      if (currentUserId) {
        await activityService.logActivity(
          currentUserId,
          'user_update',
          `Updated user ${userId}`
        );
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
      };
    }
  },

  deleteUser: async (userId, currentUserId) => {
    try {
      const response = await api.delete(`/users/${userId}`);

      if (currentUserId) {
        await activityService.logActivity(
          currentUserId,
          'user_delete',
          `Deleted user ${userId}`
        );
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user',
      };
    }
  },
};

export const preferencesService = {
  getUserPreferences: async (userId) => {
    try {
      const response = await api.get(`/preferences/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            userId,
            pushNotifications: true,
            theme: 'light',
          },
          isDefault: true,
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch preferences',
      };
    }
  },

  savePreferences: async (userId, preferences) => {
    try {
      const existing = await api.get(`/preferences/${userId}`).catch(() => null);

      let response;
      if (existing?.data) {
        response = await api.put(`/preferences/${userId}`, {
          userId,
          ...preferences,
        });
      } else {
        response = await api.post('/preferences/', {
          userId,
          pushNotifications: preferences.pushNotifications ?? true,
          theme: preferences.theme || 'light',
        });
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save preferences',
      };
    }
  },
};

export const activityService = {
  logActivity: async (userId, activityType, activityDescription) => {
    try {
      const response = await api.post('/activity', {
        userId,
        activityType,
        activityDescription,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  getAllActivity: async () => {
    try {
      const response = await api.get('/activity');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch activity',
      };
    }
  },

  getUserActivity: async (userId) => {
    try {
      const response = await api.get(`/activity/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user activity',
      };
    }
  },

  getActivityByType: async (activityType) => {
    try {
      const response = await api.get(`/activity/type/${activityType}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch activity',
      };
    }
  },
};

export const messagesService = {
  getAllMessages: async () => {
    try {
      const response = await api.get('/messages');
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch messages',
      };
    }
  },

  getMessagesBySender: async (userId) => {
    try {
      const response = await api.get(`/messages/sender/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch sent messages',
      };
    }
  },

  getMessagesByRecipient: async (userId) => {
    try {
      const response = await api.get(`/messages/recipient/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch received messages',
      };
    }
  },

  getConversation: async (userId1, userId2) => {
    try {
      const response = await api.get(`/messages/between/${userId1}/${userId2}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch conversation',
      };
    }
  },

  sendMessage: async (senderId, recipientId, messageText) => {
    try {
      const response = await api.post('/messages/', {
        senderId,
        recipientId,
        messageText,
      });

      await activityService.logActivity(
        senderId,
        'message_sent',
        `Sent message to user ${recipientId}`
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      };
    }
  },

  deleteMessage: async (messageId, userId) => {
    try {
      const response = await api.delete(`/messages/${messageId}`);

      await activityService.logActivity(
        userId,
        'message_delete',
        `Deleted message ${messageId}`
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete message',
      };
    }
  },
};

export const rolesService = {
  getAllRoles: async () => {
    try {
      const response = await api.get('/roles');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch roles',
      };
    }
  },

  getRoleById: async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch role',
      };
    }
  },
};

export default api;
