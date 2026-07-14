import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { activityService } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ActivityRow from '../../components/ActivityRow';

export default function ActivityScreen() {
  const { user: currentUser, isAdmin } = useAuth();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');

  const activityTypes = [
    { value: 'all', label: 'All' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'user_create', label: 'User Create' },
    { value: 'user_update', label: 'User Update' },
    { value: 'user_delete', label: 'User Delete' },
    { value: 'message_sent', label: 'Messages' },
    { value: 'preferences_update', label: 'Preferences' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadData(filterType);
    }, [])
  );

  const loadData = async (type = filterType) => {
    if (!currentUser) return;
    try {
      setError('');
      let result;

      if (isAdmin) {
        result = type === 'all'
          ? await activityService.getAllActivity()
          : await activityService.getActivityByType(type);
      } else {
        result = await activityService.getUserActivity(currentUser.id);

        if (result.success && type !== 'all') {
          result.data = result.data.filter(a => a.activityType === type);
        }
      }

      if (result?.success) {
        const sorted = (result.data || []).sort((a, b) => {
          const dateA = new Date(a.activityTimestamp || a.timestamp || a.createdAt);
          const dateB = new Date(b.activityTimestamp || b.timestamp || b.createdAt);
          return dateB - dateA;
        });
        setActivities(sorted);
      } else {
        setError(result?.message || 'Failed to load activity');
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

  const handleFilterChange = (type) => {
    setFilterType(type);
    setIsLoading(true);
    loadData(type);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading activity..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Activity"
        subtitle={isAdmin ? `${activities.length} total activities` : 'Your activity'}
      />

      <View style={styles.filtersWrapper}>
        <View style={styles.filterRow}>
          {activityTypes.map(type => (
            <Button
              key={type.value}
              title={type.label}
              variant={filterType === type.value ? 'primary' : 'outline'}
              onPress={() => handleFilterChange(type.value)}
              size="small"
              style={styles.filterButton}
            />
          ))}
        </View>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={<Text style={styles.emptyIcon}>📊</Text>}
          title="No activity"
          message={
            filterType === 'all'
              ? 'No activity logs found'
              : `No ${filterType.replace(/_/g, ' ')} activity found`
          }
        />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item, index) => `activity-${item.activityId || item.id || index}`}
          renderItem={({ item }) => <ActivityRow activity={item} />}
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
    marginBottom: 4,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
