import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen, Field, Btn, ErrorText } from '../../components/ui';
import { spacing, typography } from '../../constants/theme';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      setError('ورود ناموفق: ' + err.message);
      return;
    }
    router.replace('/');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen>
        <View style={{ height: spacing.xl * 2 }} />
        <Text style={{ ...typography.title, color: colors.text, textAlign: 'center', marginBottom: spacing.xl }}>ورود به Bizly</Text>
        <Field placeholder="ایمیل" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field placeholder="رمز عبور" value={password} onChangeText={setPassword} secureTextEntry />
        <ErrorText text={error} />
        <Btn label={loading ? 'در حال ورود...' : 'ورود'} onPress={handleLogin} disabled={loading} />
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.primaryLight }}>حساب ندارید؟ ثبت‌نام کنید</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>رمز عبور را فراموش کرده‌ام</Text>
        </TouchableOpacity>
      </Screen>
    </View>
  );
}
