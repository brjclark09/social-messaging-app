import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { messagesService, userService } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SendMessageScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    recipientId: null,
    messageText: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await userService.getAllUsers();

      if (result.success) {
        setUsers(result.data.filter(u => u.id !== currentUser.id));
      } else {
        showError('Failed to load users');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientId) {
      newErrors.recipientId = 'Please select a recipient';
    }

    if (!formData.messageText.trim()) {
      newErrors.messageText = 'Message cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSending(true);

    try {
      const result = await messagesService.sendMessage(
        currentUser.id,
        formData.recipientId,
        formData.messageText.trim()
      );

      if (result.success) {
        showSuccess('Message sent successfully');
        router.back();
      } else {
        showError(result.message || 'Failed to send message');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading users..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Send Message"
        subtitle="Send a message to another user"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <Text style={styles.sectionTitle}>Recipient</Text>

            {errors.recipientId && (
              <Text style={styles.errorText}>{errors.recipientId}</Text>
            )}

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.recipientSelector}
            >
              {users.map(user => (
                <Button
                  key={user.id}
                  title={`${user.firstName} ${user.lastName}`}
                  variant={formData.recipientId === user.id ? 'primary' : 'outline'}
                  onPress={() => updateField('recipientId', user.id)}
                  disabled={isSending}
                  size="small"
                  style={styles.userButton}
                />
              ))}
            </ScrollView>
          </Card>

          <Card style={styles.cardSpacing}>
            <Text style={styles.sectionTitle}>Message</Text>

            <Input
              value={formData.messageText}
              onChangeText={(value) => updateField('messageText', value)}
              placeholder="Type your message..."
              error={errors.messageText}
              multiline
              numberOfLines={6}
              editable={!isSending}
            />
          </Card>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              disabled={isSending}
              style={styles.actionButton}
            />
            <Button
              title="Send Message"
              onPress={handleSubmit}
              loading={isSending}
              disabled={isSending}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  errorText: {
    fontSize: typography.fontSizeSm,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  recipientSelector: {
    marginVertical: spacing.sm,
  },
  userButton: {
    marginRight: spacing.sm,
  },
  cardSpacing: {
    marginTop: spacing.base,
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