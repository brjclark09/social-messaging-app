import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatRelativeTimeLong } from '../utils/format';

export default function ActivityRow({ activity }) {
  const getActivityColor = (type) => {
    const typeStr = (type || '').toLowerCase();

    if (typeStr.includes('login')) return colors.success;
    if (typeStr.includes('logout')) return colors.gray500;
    if (typeStr.includes('create')) return colors.info;
    if (typeStr.includes('update')) return colors.warning;
    if (typeStr.includes('delete')) return colors.error;
    if (typeStr.includes('message')) return colors.primary;
    if (typeStr.includes('preference')) return colors.gray600;

    return colors.gray400;
  };

  const getActivityIcon = (type) => {
    const typeStr = (type || '').toLowerCase();

    if (typeStr.includes('login')) return '🔓';
    if (typeStr.includes('logout')) return '🔒';
    if (typeStr.includes('create')) return '➕';
    if (typeStr.includes('update')) return '✏️';
    if (typeStr.includes('delete')) return '🗑️';
    if (typeStr.includes('message')) return '💬';
    if (typeStr.includes('preference')) return '⚙️';

    return '📝';
  };

  const formatActivityType = (type) => {
    if (!type) return 'Unknown';
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getActivityColor(activity.activityType) + '20' }]}>
        <Text style={styles.icon}>{getActivityIcon(activity.activityType)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.activityType} numberOfLines={1}>
            {formatActivityType(activity.activityType)}
          </Text>
          <Text style={styles.timestamp}>
            {formatRelativeTimeLong(activity.activityTimestamp || activity.timestamp || activity.createdAt)}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {activity.activityDescription}
        </Text>

        {activity.userName && (
          <Text style={styles.userName}>
            by {activity.userName}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  activityType: {
    flex: 1,
    fontSize: typography.fontSizeBase,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  timestamp: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
  },
  description: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    lineHeight: typography.lineHeightNormal * typography.fontSizeSm,
  },
  userName: {
    fontSize: typography.fontSizeXs,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});
