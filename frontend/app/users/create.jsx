import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { userService } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';

export default function CreateUserScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: 2,
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await userService.createUser(formData, currentUser.id);

      if (result.success) {
        showSuccess('User created successfully');
        router.back();
      } else {
        showError(result.message || 'Failed to create user');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Create User"
        subtitle="Add a new user to the system"
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
              editable={!isLoading}
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
              placeholder="Enter last name"
              error={errors.lastName}
              autoCapitalize="words"
              editable={!isLoading}
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Enter email address"
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              placeholder="Min. 8 characters"
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
              helperText="Must be at least 8 characters"
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
                  disabled={isLoading}
                  style={styles.toggleButton}
                />
                <Button
                  title="Admin"
                  variant={formData.roleId === 1 ? 'primary' : 'outline'}
                  onPress={() => updateField('roleId', 1)}
                  disabled={isLoading}
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
                  disabled={isLoading}
                  style={styles.toggleButton}
                />
                <Button
                  title="Inactive"
                  variant={!formData.active ? 'primary' : 'outline'}
                  onPress={() => updateField('active', false)}
                  disabled={isLoading}
                  style={styles.toggleButton}
                />
              </View>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
              disabled={isLoading}
              style={styles.actionButton}
            />
            <Button
              title="Create User"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
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