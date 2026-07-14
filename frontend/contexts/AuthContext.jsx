import { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService, preferencesService, activityService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    pushNotifications: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        await loadUserPreferences(userData.id);
      }
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPreferences = async (userId) => {
    try {
      const result = await preferencesService.getUserPreferences(userId);

      if (result.success) {
        if (result.isDefault) {
          await preferencesService.savePreferences(userId, {
            pushNotifications: true,
            theme: 'light',
          });
          setPreferences({ pushNotifications: true, theme: 'light' });
        } else {
          setPreferences({
            theme: result.data.theme || 'light',
            pushNotifications: result.data.pushNotifications ?? true,
          });
        }
      }
    } catch (error) {
      setPreferences({ theme: 'light', pushNotifications: true });
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (!result.success) {
        return result;
      }

      // The login response body contains the user data directly
      let loggedInUser = result.data?.id ? result.data : null;

      // Fallback: decode JWT to get user ID and call getUserById
      if (!loggedInUser) {
        try {
          const payload = result.token.split('.')[1];
          const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
          const decoded = JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
          const userId = decoded.sub || decoded.id || decoded.userId || decoded.user_id;

          if (userId) {
            const userResult = await userService.getUserById(userId);
            if (userResult.success) {
              loggedInUser = userResult.data;
            }
          }
        } catch {}
      }

      if (loggedInUser) {
        await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);

        await loadUserPreferences(loggedInUser.id);

        await activityService.logActivity(
          loggedInUser.id,
          'login',
          'User logged in via mobile app'
        );

        return { success: true };
      } else {
        return { success: false, message: 'User account not found' };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      if (user?.id) {
        await authService.logout(user.id);
      }

      setUser(null);
      setPreferences({ theme: 'light', pushNotifications: true });

      return { success: true };
    } catch (error) {
      setUser(null);
      setPreferences({ theme: 'light', pushNotifications: true });
      return { success: true };
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      if (!user?.id) {
        return { success: false, message: 'No user logged in' };
      }

      const result = await preferencesService.savePreferences(user.id, newPreferences);

      if (result.success) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));

        await activityService.logActivity(
          user.id,
          'preferences_update',
          'User updated preferences'
        );

        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update preferences',
      };
    }
  };

  const refreshUser = async () => {
    try {
      if (!user?.id) return;

      const result = await userService.getUserById(user.id);

      if (result.success) {
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        setUser(result.data);
      }
    } catch (error) {
      // silent
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.roleId === 1,
    preferences,
    login,
    logout,
    updatePreferences,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
