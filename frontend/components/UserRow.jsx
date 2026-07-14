import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Badge from './Badge';

export default function UserRow({ user, onDelete, isAdmin }) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/users/${user.id}`);
  };

  const handleEdit = () => {
    router.push(`/users/edit/${user.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.mainInfo}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.metaInfo}>
          <Badge
            label={user.roleId === 1 ? 'Admin' : 'User'}
            variant={user.roleId === 1 ? 'admin' : 'user'}
          />
          <Badge
            label={user.active ? 'Active' : 'Inactive'}
            variant={user.active ? 'active' : 'inactive'}
          />
        </View>
      </View>

      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={handleView}
          >
            <Text style={styles.actionIcon}>👁️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(user)}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  mainInfo: {
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.fontSizeBase,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  email: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: spacing.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: colors.gray100,
  },
  editButton: {
    backgroundColor: colors.primaryLight,
  },
  deleteButton: {
    backgroundColor: colors.errorLight,
  },
  actionIcon: {
    fontSize: 18,
  },
});
