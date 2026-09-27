import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Index() {
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
