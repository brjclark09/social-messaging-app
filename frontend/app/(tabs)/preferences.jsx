import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import ScreenHeader from '../../components/ScreenHeader';

export default function PreferencesScreen() {
  const { user, preferences, updatePreferences } = useAuth();
  const { showSuccess, showError } = useToast();

  const [localPreferences, setLocalPreferences] = useState({
    theme: 'light',
    pushNotifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = async (key, value) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
    setIsSaving(true);
    try {
      const result = await updatePreferences({ [key]: value });

      if (result.success) {
        showSuccess('Preference updated');
      } else {
        setLocalPreferences(prev => ({ ...prev, [key]: !value }));
        showError(result.message || 'Failed to update preference');
      }
    } catch (err) {
      setLocalPreferences(prev => ({ ...prev, [key]: !value }));
      showError('Failed to update preference');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Settings"
        subtitle="Manage your preferences"
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{user?.email}</Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Role</Text>
            <Badge
              label={user?.roleId === 1 ? 'Admin' : 'User'}
              variant={user?.roleId === 1 ? 'admin' : 'user'}
            />
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Status</Text>
            <Badge
              label={user?.active ? 'Active' : 'Inactive'}
              variant={user?.active ? 'active' : 'inactive'}
            />
          </View>
        </Card>

        <Card style={styles.cardSpacing}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Theme</Text>
              <Text style={styles.preferenceDescription}>
                {localPreferences.theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </Text>
            </View>
            <Switch
              value={localPreferences.theme === 'dark'}
              onValueChange={(value) => handleToggle('theme', value ? 'dark' : 'light')}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={colors.white}
              disabled={isSaving}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Push Notifications</Text>
              <Text style={styles.preferenceDescription}>
                {localPreferences.pushNotifications ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={localPreferences.pushNotifications}
              onValueChange={(value) => handleToggle('pushNotifications', value)}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={colors.white}
              disabled={isSaving}
            />
          </View>
        </Card>

        <Card style={styles.cardSpacing}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{user?.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoValue}>
              {user?.roleId === 1 ? 'Administrator' : 'Standard User'}
            </Text>
          </View>
        </Card>

        {isSaving && (
          <View style={styles.savingIndicator}>
            <Text style={styles.savingText}>Saving...</Text>
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
    paddingBottom: spacing.xxxl,
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
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  profileLabel: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.textSecondary,
  },
  profileValue: {
    fontSize: typography.fontSizeBase,
    color: colors.textPrimary,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  preferenceLabel: {
    fontSize: typography.fontSizeBase,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  preferenceDescription: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSizeBase,
    color: colors.textPrimary,
  },
  savingIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  savingText: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    fontStyle: 'italic',
  },
});
