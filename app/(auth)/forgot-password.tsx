import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    setMessage(error ? 'خطا در ارسال ایمیل' : 'ایمیل بازیابی رمز ارسال شد');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.md, textAlign: 'center' }}>
        بازیابی رمز عبور
      </Text>
      <Text style={{ ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center' }}>
        ایمیل خود را وارد کنید تا لینک بازیابی رمز برایتان ارسال شود.
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
        }}
      />

      {message ? (
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' }}>{message}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', ...typography.subtitle }}>
          {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}