import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserRow from '../../components/UserRow';

export default function UsersScreen() {
  const router = useRouter();
  const { user: currentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    if (!currentUser) return;
    try {
      setError('');
      const result = await userService.getAllUsers();

      if (result.success) {
        setUsers(isAdmin ? result.data : result.data.filter(u => u.id === currentUser.id));
      } else {
        setError(result.message || 'Failed to load users');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUsers();
  };

  const handleAddUser = () => {
    router.push('/users/create');
  };

  const handleDeleteUser = async (user) => {
    try {
      const result = await userService.deleteUser(user.id, currentUser.id);

      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showSuccess(`${user.firstName} ${user.lastName} deleted successfully`);
      } else {
        showError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading users..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Users"
        subtitle={isAdmin ? `${users.length} total users` : 'Your profile'}
        rightAction={
          isAdmin && (
            <Button
              title="Add User"
              onPress={handleAddUser}
              size="small"
            />
          )
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={loadUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Text style={styles.emptyIcon}>👥</Text>}
          title="No users found"
          message="There are no users in the system yet."
          action={
            isAdmin && (
              <Button title="Add First User" onPress={handleAddUser} />
            )
          }
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onDelete={handleDeleteUser}
              isAdmin={isAdmin}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
