import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Btn, Muted } from '../../components/ui';
import { spacing, typography } from '../../constants/theme';

export default function PendingApprovalScreen() {
  const { colors } = useTheme();
  const { refreshProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  async function check() {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
    router.replace('/');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, textAlign: 'center', marginBottom: spacing.sm }}>در انتظار تأیید مدیر</Text>
      <Muted style={{ textAlign: 'center', marginBottom: spacing.xl }}>حساب شما ثبت شد. به‌محض تأیید مدیر کسب‌وکار می‌توانید از برنامه استفاده کنید.</Muted>
      <Btn label={checking ? 'در حال بررسی...' : 'بررسی وضعیت تأیید'} onPress={check} disabled={checking} />
      <Btn label="خروج از حساب" variant="ghost" onPress={signOut} />
    </View>
  );
}
