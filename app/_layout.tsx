import { Stack, Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ActivityIndicator, View } from 'react-native';

function RootNavigation() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (profile?.role === 'manager') {
    return <Redirect href="/(manager)/dashboard" />;
  }

  return <Redirect href="/(employee)/my-sales" />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <RootNavigation />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
