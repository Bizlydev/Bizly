import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function PendingApprovalScreen() {
  const { colors } = useTheme();
  const { signOut } = useAuth();

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    }}>
      <Text style={{ ...typography.title, color: colors.text, textAlign: 'center', marginBottom: spacing.sm }}>
        در انتظار تأیید مدیر
      </Text>
      <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }}>
        حساب شما ثبت شد. به‌محض تأیید مدیر کسب‌وکار، می‌توانید وارد شوید.
      </Text>
      <TouchableOpacity
        onPress={signOut}
        style={{
          backgroundColor: colors.surface,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, ...typography.subtitle }}>خروج از حساب</Text>
      </TouchableOpacity>
    </View>
  );
}
