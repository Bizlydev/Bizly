import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { validateEmail } from '../../lib/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const result = validateEmail(email);
    if (!result.valid) return Alert.alert('Check your email', result.message);
    if (!isSupabaseConfigured) return Alert.alert('Configuration required', 'Set up Supabase before requesting a reset.');
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (error) throw error;
      Alert.alert('Check your inbox', 'If an account exists for this address, a reset link will be sent.');
    } catch (error) { Alert.alert('Request failed', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  }

  return <View style={styles.page}><Text style={styles.title}>Reset your password</Text><Text style={styles.subtitle}>Enter the email address associated with your account.</Text>
    <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
    <AppButton loading={busy} onPress={submit}>Send reset link</AppButton>
    <Link href="/(auth)/login" style={styles.link}>Back to sign in</Link>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 27, fontWeight: '800', color: '#0F172A' }, subtitle: { fontSize: 15, color: '#64748B', marginTop: 10, marginBottom: 26, lineHeight: 22 },
  link: { color: '#2563EB', textAlign: 'center', marginTop: 22, fontWeight: '600' },
});
