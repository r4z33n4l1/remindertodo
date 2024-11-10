import { Stack } from 'expo-router';

export default function TodoLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Tasks',
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}
