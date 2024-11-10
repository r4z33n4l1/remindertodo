import { useContext } from 'react';
import { Stack } from "expo-router";
import { AuthContext, AuthProvider } from '../providers/AuthProvider';
import { TodoProvider } from '../providers/TodoProvider';
import { ActivityIndicator, View, AppState } from 'react-native';
import { supabase } from '../utils/supabase';
import { NotificationProvider } from '@/providers/NotificationProvider';

// Set up auto refresh for auth session
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

function RootLayoutNav() {
  const { session, loading } = useContext(AuthContext);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Define all possible screens but control access through session
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!session ? (
        // Auth screens
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      ) : (
        // Protected screens
        <Stack>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>

      
      <TodoProvider>
        <RootLayoutNav />
      </TodoProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
