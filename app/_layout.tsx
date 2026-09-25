import { Stack, Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ActivityIndicator, View } from 'react-native';

function RootNavigation() {
  const { session, profile, loading, isPending } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isPending) {
    return <Redirect href="/(auth)/pending-approval" />;
  }

  if (profile?.role === 'manager') {
    return <Redirect href="/(manager)/dashboard" />;
  }

  return <Redirect href="/(employee)/my-sales" />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <RootNavigation />
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
