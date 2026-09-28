import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../lib/validation';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const e = validateEmail(email); const p = validatePassword(password);
    if (!e.valid) return Alert.alert('Check your email', e.message);
    if (!p.valid) return Alert.alert('Check your password', p.message);
    setBusy(true);
    try {
      await signUp(email, password);
      Alert.alert('Account created', 'Check your email if confirmation is enabled.', [{ text: 'Continue', onPress: () => router.replace('/(auth)/login') }]);
    } catch (error) { Alert.alert('Unable to create account', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  }

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}><View style={styles.form}>
    <Text style={styles.brand}>Bizly</Text><Text style={styles.title}>Create your account</Text><Text style={styles.subtitle}>Start organizing your business in one place.</Text>
    <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" />
    <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="At least 8 characters" />
    <AppButton loading={busy} onPress={submit}>Create account</AppButton>
    <Text style={styles.footer}>Already registered? <Link href="/(auth)/login" style={styles.link}>Sign in</Link></Text>
  </View></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 22 },
  form: { backgroundColor: '#FFFFFF', padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  brand: { color: '#2563EB', fontSize: 20, fontWeight: '800', marginBottom: 20 }, title: { color: '#0F172A', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 15, marginTop: 8, marginBottom: 24 }, link: { color: '#2563EB', fontWeight: '600' },
  footer: { color: '#64748B', textAlign: 'center', marginTop: 22 },
});
