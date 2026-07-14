import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAdmin, logout } = useAuth();
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      showError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Welcome to the App!</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.firstName} {user?.lastName}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{isAdmin ? 'Admin' : 'User'}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{user?.id}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]} 
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#000',
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  value: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  logoutButton: {
    marginTop: 40,
    height: 50,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    backgroundColor: '#FFB3AF',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});