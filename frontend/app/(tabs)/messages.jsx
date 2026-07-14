import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { messagesService, userService } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessageRow from '../../components/MessageRow';

export default function MessagesScreen() {
  const router = useRouter();
  const { user: currentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData(viewMode, selectedUserId);
    }, [])
  );

  const loadData = async (mode = viewMode, userId = selectedUserId) => {
    if (!currentUser) return;
    try {
      setError('');
      let messagesResult;

      if (isAdmin) {
        if (mode === 'sent') {
          messagesResult = await messagesService.getMessagesBySender(currentUser.id);
        } else if (mode === 'received') {
          messagesResult = await messagesService.getMessagesByRecipient(currentUser.id);
        } else if (mode === 'conversation' && userId) {
          messagesResult = await messagesService.getConversation(currentUser.id, userId);
        } else {
          messagesResult = await messagesService.getAllMessages();
        }
      } else {
        if (mode === 'sent') {
          messagesResult = await messagesService.getMessagesBySender(currentUser.id);
        } else if (mode === 'received') {
          messagesResult = await messagesService.getMessagesByRecipient(currentUser.id);
        } else {
          const [sent, received] = await Promise.all([
            messagesService.getMessagesBySender(currentUser.id),
            messagesService.getMessagesByRecipient(currentUser.id),
          ]);

          if (sent.success && received.success) {
            messagesResult = {
              success: true,
              data: [...sent.data, ...received.data].sort((a, b) =>
                new Date(b.sentAt) - new Date(a.sentAt)
              ),
            };
          } else {
            messagesResult = sent.success ? sent : received;
          }
        }
      }

      if (messagesResult?.success) {
        setMessages(messagesResult.data || []);
      } else {
        setError(messagesResult?.message || 'Failed to load messages');
      }

      if (isAdmin && mode === 'conversation' && !userId) {
        const usersResult = await userService.getAllUsers();
        if (usersResult.success) {
          setUsers(usersResult.data.filter(u => u.id !== currentUser.id));
        }
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
    loadData();
  };

  const handleSendMessage = () => {
    router.push('/messages/send');
  };

  const handleViewConversation = (message) => {
    const otherUserId = message.senderId === currentUser.id
      ? message.recipientId
      : message.senderId;
    router.push(`/messages/conversation/${otherUserId}`);
  };

  const handleDeleteMessage = async (message) => {
    const messageId = message.messageId;

    if (!messageId || messageId <= 0) {
      showError('Unable to delete: message ID not found');
      return;
    }

    try {
      const result = await messagesService.deleteMessage(messageId, currentUser.id);

      if (result.success) {
        setMessages(prev => prev.filter(m => m.messageId !== messageId));
        showSuccess('Message deleted');
      } else {
        showError(result.message || 'Failed to delete message');
      }
    } catch (err) {
      showError('Failed to delete message');
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedUserId(null);
    setIsLoading(true);
    loadData(mode, null);
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setIsLoading(true);
    loadData(viewMode, userId);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading messages..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Messages"
        subtitle={`${messages.length} message${messages.length !== 1 ? 's' : ''}`}
        rightAction={
          <Button title="Send" onPress={handleSendMessage} size="small" />
        }
      />

      <View style={styles.filtersWrapper}>
        <View style={styles.filterRow}>
          <Button
            title="All"
            variant={viewMode === 'all' ? 'primary' : 'outline'}
            onPress={() => handleViewModeChange('all')}
            size="small"
            style={styles.filterButton}
          />
          <Button
            title="Sent"
            variant={viewMode === 'sent' ? 'primary' : 'outline'}
            onPress={() => handleViewModeChange('sent')}
            size="small"
            style={styles.filterButton}
          />
          <Button
            title="Received"
            variant={viewMode === 'received' ? 'primary' : 'outline'}
            onPress={() => handleViewModeChange('received')}
            size="small"
            style={styles.filterButton}
          />
          {isAdmin && (
            <Button
              title="Conversation"
              variant={viewMode === 'conversation' ? 'primary' : 'outline'}
              onPress={() => handleViewModeChange('conversation')}
              size="small"
              style={styles.filterButton}
            />
          )}
        </View>
      </View>

      {viewMode === 'conversation' && !selectedUserId && isAdmin && (
        <View style={styles.userSelectorWrapper}>
          <Text style={styles.userSelectorLabel}>Select User:</Text>
          <View style={styles.userButtonsRow}>
            {users.map(user => (
              <Button
                key={user.id}
                title={`${user.firstName} ${user.lastName}`}
                variant="outline"
                onPress={() => handleSelectUser(user.id)}
                size="small"
                style={styles.userButton}
              />
            ))}
          </View>
        </View>
      )}

      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<Text style={styles.emptyIcon}>💬</Text>}
          title="No messages"
          message={
            viewMode === 'conversation' && !selectedUserId
              ? 'Select a user to view their conversation'
              : 'No messages found'
          }
          action={
            viewMode !== 'conversation' && (
              <Button title="Send Message" onPress={handleSendMessage} />
            )
          }
        />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => `msg-${item.messageId}`}
          renderItem={({ item }) => (
            <MessageRow
              message={item}
              onPress={() => handleViewConversation(item)}
              onDelete={handleDeleteMessage}
              isAdmin={isAdmin}
              currentUserId={currentUser?.id}
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
  filtersWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    marginBottom: 0,
  },
  userSelectorWrapper: {
    backgroundColor: colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  userSelectorLabel: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  userButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  userButton: {
    marginBottom: 0,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
