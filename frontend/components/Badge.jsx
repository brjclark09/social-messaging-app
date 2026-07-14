import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Reusable badge component for displaying role and status labels.
 *
 * variant:
 *   'admin'    — blue background (primary)
 *   'user'     — gray background
 *   'active'   — green background (success)
 *   'inactive' — red background (error)
 *   'sent'     — blue-info background
 *   'received' — green background
 */
export default function Badge({ label, variant = 'user', style }) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.radiusSm,
  },
  admin: {
    backgroundColor: colors.primaryLight,
  },
  user: {
    backgroundColor: colors.gray100,
  },
  active: {
    backgroundColor: colors.successLight,
  },
  inactive: {
    backgroundColor: colors.errorLight,
  },
  sent: {
    backgroundColor: colors.infoLight,
  },
  received: {
    backgroundColor: colors.successLight,
  },
  text: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
  },
});
