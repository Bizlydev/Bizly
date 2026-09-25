import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, I18nManager } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('ایمیل یا رمز عبور اشتباه است');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.xl, textAlign: 'center' }}>
        ورود به Bizly
      </Text>

      <TextInput
        placeholder="ایمیل"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          textAlign: I18nManager.isRTL ? 'right' : 'left',
        }}
      />

      <TextInput
        placeholder="رمز عبور"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
          textAlign: I18nManager.isRTL ? 'right' : 'left',
        }}
      />

      {error ? (
        <Text style={{ color: colors.danger, marginBottom: spacing.md, textAlign: 'center' }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
          marginTop: spacing.sm,
        }}
      >
        <Text style={{ color: '#FFFFFF', ...typography.subtitle }}>
          {loading ? 'در حال ورود...' : 'ورود'}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.primaryLight }}>حساب ندارید؟ ثبت‌نام کنید</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
