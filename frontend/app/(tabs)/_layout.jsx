import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          height: spacing.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSizeXs,
          fontWeight: typography.fontWeightMedium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarLabel: 'Users',
          tabBarIcon: ({ color, size }) => (
            <UsersIcon color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MessagesIcon color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <ActivityIcon color={color} size={size} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="preferences"
        options={{
          title: 'Preferences',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

function HomeIcon({ color, size }) {
  return <Text style={{ color, fontSize: size }}>🏠</Text>;
}

function UsersIcon({ color, size }) {
  return <Text style={{ color, fontSize: size }}>👥</Text>;
}

function MessagesIcon({ color, size }) {
  return <Text style={{ color, fontSize: size }}>💬</Text>;
}

function ActivityIcon({ color, size }) {
  return <Text style={{ color, fontSize: size }}>📊</Text>;
}

function SettingsIcon({ color, size }) {
  return <Text style={{ color, fontSize: size }}>⚙️</Text>;
}