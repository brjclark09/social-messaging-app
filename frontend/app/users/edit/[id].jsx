import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../services/api';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ScreenHeader from '../../../components/ScreenHeader';
import Card from '../../../components/Card';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function EditUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleId: 2,
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const result = await userService.getUserById(id);

      if (result.success) {
        setFormData({
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
          roleId: result.data.roleId,
          active: result.data.active,
        });
      } else {
        showError(result.message || 'Failed to load user');
        router.back();
      }
    } catch (err) {
      showError('An unexpected error occurred');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const updateData = {
        id: parseInt(id),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
        active: formData.active,
      };

      const result = await userService.updateUser(id, updateData, currentUser.id);

      if (result.success) {
        showSuccess('User updated successfully');
        router.back();
      } else {
        showError(result.message || 'Failed to update user');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading user..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Edit User"
        subtitle="Update user information"
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
            <Text style={styles.sectionTitle}>User Information</Text>

            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => updateField('firstName', value)}
              placeholder="Enter first name"
              error={errors.firstName}
              autoCapitalize="words"
              editable={!isSaving}
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
              placeholder="Enter last name"
              error={errors.lastName}
              autoCapitalize="words"
              editable={!isSaving}
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter email address"
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSaving}
            />
          </Card>

          <Card style={styles.cardSpacing}>
            <Text style={styles.sectionTitle}>Role & Status</Text>

            <View style={styles.toggleGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.toggleButtons}>
                <Button
                  title="User"
                  variant={formData.roleId === 2 ? 'primary' : 'outline'}
                  onPress={() => updateField('roleId', 2)}
                  disabled={isSaving}
                  style={styles.toggleButton}
                />
                <Button
                  title="Admin"
                  variant={formData.roleId === 1 ? 'primary' : 'outline'}
                  onPress={() => updateField('roleId', 1)}
                  disabled={isSaving}
                  style={styles.toggleButton}
                />
              </View>
            </View>

            <View style={styles.toggleGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.toggleButtons}>
                <Button
                  title="Active"
                  variant={formData.active ? 'primary' : 'outline'}
                  onPress={() => updateField('active', true)}
                  disabled={isSaving}
                  style={styles.toggleButton}
                />
                <Button
                  title="Inactive"
                  variant={!formData.active ? 'primary' : 'outline'}
                  onPress={() => updateField('active', false)}
                  disabled={isSaving}
                  style={styles.toggleButton}
                />
              </View>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              disabled={isSaving}
              style={styles.actionButton}
            />
            <Button
              title="Save Changes"
              onPress={handleSubmit}
              loading={isSaving}
              disabled={isSaving}
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
  cardSpacing: {
    marginTop: spacing.base,
  },
  toggleGroup: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
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