import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';

export default function UserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isAdmin, user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setError('');
      const result = await userService.getUserById(id);

      if (result.success) {
        setUser(result.data);
      } else {
        setError(result.message || 'Failed to load user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/users/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      const result = await userService.deleteUser(id, currentUser.id);

      if (result.success) {
        showSuccess('User deleted successfully');
        router.back();
      } else {
        showError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading user..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="User Details" />
        <ErrorState message={error} onRetry={() => router.back()} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="User Details"
        subtitle={`${user.firstName} ${user.lastName}`}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <Text style={styles.fieldValue}>
              {user.firstName} {user.lastName}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user.email}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>User ID</Text>
            <Text style={styles.fieldValue}>{user.id}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Role</Text>
            <Badge
              label={user.roleId === 1 ? 'Admin' : 'User'}
              variant={user.roleId === 1 ? 'admin' : 'user'}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Status</Text>
            <Badge
              label={user.active ? 'Active' : 'Inactive'}
              variant={user.active ? 'active' : 'inactive'}
            />
          </View>
        </Card>

        {isAdmin && (
          <View style={styles.actions}>
            <Button
              title="Edit User"
              onPress={handleEdit}
              style={styles.actionButton}
            />
            <Button
              title="Delete User"
              variant="danger"
              onPress={handleDelete}
              style={styles.actionButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  field: {
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  fieldLabel: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldValue: {
    fontSize: typography.fontSizeBase,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
