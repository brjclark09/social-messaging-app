import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { messagesService, userService } from '../../../services/api';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function ConversationScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConversation();
    loadOtherUser();
  }, [userId]);

  const loadOtherUser = async () => {
    try {
      const result = await userService.getUserById(userId);
      if (result.success) {
        setOtherUser(result.data);
      }
    } catch (err) {
      // silent
    }
  };

  const loadConversation = async () => {
    try {
      const result = await messagesService.getConversation(currentUser.id, userId);

      if (result.success) {
        const sorted = (result.data || []).sort((a, b) =>
          new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
        );
        setMessages(sorted);
      } else {
        showError(result.message || 'Failed to load conversation');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);

    try {
      const result = await messagesService.sendMessage(
        currentUser.id,
        parseInt(userId),
        newMessage.trim()
      );

      if (result.success) {
        setNewMessage('');
        loadConversation();
      } else {
        showError(result.message || 'Failed to send message');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

    const renderMessage = ({ item }) => {
    const isSender = item.senderId === currentUser.id;

    return (
      <View style={[
        styles.messageBubble,
        isSender ? styles.messageSent : styles.messageReceived
      ]}>
        <Text style={[
          styles.messageText,
          isSender ? styles.messageTextSent : styles.messageTextReceived
        ]}>
          {item.messageText}
        </Text>
        <Text style={[
          styles.messageTime,
          isSender ? styles.messageTimeSent : styles.messageTimeReceived
        ]}>
          {formatTime(item.sentAt || item.timestamp || item.createdAt)}
        </Text>
      </View>
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading conversation..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Conversation'}
        subtitle={`${messages.length} message${messages.length !== 1 ? 's' : ''}`}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={100}
      >
        {messages.length === 0 ? (
          <EmptyState
            icon={<Text style={styles.emptyIcon}>💬</Text>}
            title="No messages yet"
            message="Start the conversation by sending a message below."
          />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.messageId?.toString() || item.id?.toString() || Math.random().toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
          />
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Input
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              editable={!isSending}
              multiline={false}
              style={styles.input}
            />
          </View>
          <Button
            title="Send"
            onPress={handleSend}
            loading={isSending}
            disabled={isSending || !newMessage.trim()}
            size="small"
            style={styles.sendButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.base,
  },
  messageBubble: {
    maxWidth: '75%',
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.radiusLg,
  },
  messageSent: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  messageReceived: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray100,
  },
  messageText: {
    fontSize: typography.fontSizeBase,
    lineHeight: typography.lineHeightNormal * typography.fontSizeBase,
  },
  messageTextSent: {
    color: colors.white,
  },
  messageTextReceived: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: typography.fontSizeXs,
    marginTop: spacing.xs,
  },
  messageTimeSent: {
    color: colors.white,
    opacity: 0.8,
  },
  messageTimeReceived: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.base,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  sendButton: {
    minWidth: 70,
  },
  emptyIcon: {
    fontSize: 48,
  },
});