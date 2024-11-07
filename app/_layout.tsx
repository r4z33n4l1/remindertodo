import { useContext } from 'react';
import { Stack } from "expo-router";
import { AuthContext, AuthProvider } from '../providers/AuthProvider';
import { TodoProvider } from '../providers/TodoProvider';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { session, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <Stack>
        <Stack.Screen
          name="(auth)/login"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    );
  }

  return (
    <TodoProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="todo/add"
          options={{
            presentation: 'modal',
            title: 'Add Task',
          }}
        />
        <Stack.Screen
          name="todo/[id]"
          options={{
            title: 'Edit Task',
          }}
        />
      </Stack>
    </TodoProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
