import { Stack } from 'expo-router';

export default function UsersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Create User',
          presentation: 'card',
        }}
      />
      
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'User Details',
          presentation: 'card',
        }}
      />
      
      <Stack.Screen 
        name="edit/[id]" 
        options={{ 
          title: 'Edit User',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}