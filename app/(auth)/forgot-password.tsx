import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen, Field, Btn, Muted } from '../../components/ui';
import { spacing, typography } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    setMessage(error ? 'خطا: ' + error.message : 'ایمیل بازیابی رمز ارسال شد');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen>
        <View style={{ height: spacing.xl * 2 }} />
        <Text style={{ ...typography.title, color: colors.text, textAlign: 'center', marginBottom: spacing.md }}>بازیابی رمز عبور</Text>
        <Muted style={{ textAlign: 'center', marginBottom: spacing.lg }}>ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.</Muted>
        <Field placeholder="ایمیل" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        {message ? <Muted style={{ textAlign: 'center', marginBottom: spacing.md }}>{message}</Muted> : null}
        <Btn label={loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'} onPress={handleReset} disabled={loading} />
        <Btn label="بازگشت" variant="ghost" onPress={() => router.back()} />
      </Screen>
    </View>
  );
}
