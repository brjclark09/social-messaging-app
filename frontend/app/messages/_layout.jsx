import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="send" 
        options={{ 
          title: 'Send Message',
          presentation: 'card',
        }}
      />
      
      <Stack.Screen 
        name="conversation/[userId]" 
        options={{ 
          title: 'Conversation',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}