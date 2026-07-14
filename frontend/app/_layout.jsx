import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';

function NavigationHandler({ children }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  return children;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationHandler>
          <Stack screenOptions={{ headerShown: false }} />
        </NavigationHandler>
      </ToastProvider>
    </AuthProvider>
  );
}
