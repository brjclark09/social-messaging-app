import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Badge from './Badge';
import { formatRelativeTime } from '../utils/format';

export default function MessageRow({ message, onPress, onDelete, isAdmin, currentUserId }) {
  const isSender = message.senderId === currentUserId;
  const otherUser = isSender
    ? `To: ${message.recipientName || 'User'}`
    : `From: ${message.senderName || 'User'}`;

  const handleDeletePress = (e) => {
    e.stopPropagation();
    onDelete(message);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.participants} numberOfLines={1}>
            {otherUser}
          </Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(message.sentAt)}
          </Text>
        </View>

        <Text style={styles.messageText} numberOfLines={2}>
          {message.messageText}
        </Text>

        <View style={styles.footer}>
          <Badge label={isSender ? 'Sent' : 'Received'} variant={isSender ? 'sent' : 'received'} />

          {isAdmin && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  participants: {
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
  messageText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: typography.lineHeightNormal * typography.fontSizeSm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    padding: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: spacing.radiusSm,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
