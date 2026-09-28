import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validateRequired } from '../../lib/validation';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const emailResult = validateEmail(email);
    const passwordResult = validateRequired(password, 'Password');
    if (!emailResult.valid) return Alert.alert('Check your email', emailResult.message);
    if (!passwordResult.valid) return Alert.alert('Password required', passwordResult.message);
    setBusy(true);
    try { await signIn(email, password); router.replace('/(app)/dashboard'); }
    catch (error) { Alert.alert('Unable to sign in', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  }

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}><View style={styles.form}>
    <Text style={styles.brand}>Bizly</Text><Text style={styles.title}>Welcome back</Text><Text style={styles.subtitle}>Sign in to manage your business.</Text>
    <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" />
    <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Enter your password" />
    <Link href="/(auth)/forgot-password" style={styles.link}>Forgot password?</Link>
    <AppButton loading={busy} onPress={submit}>Sign in</AppButton>
    <Text style={styles.footer}>Don't have an account? <Link href="/(auth)/register" style={styles.link}>Create one</Link></Text>
  </View></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 22 },
  form: { backgroundColor: '#FFFFFF', padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  brand: { color: '#2563EB', fontSize: 20, fontWeight: '800', marginBottom: 20 }, title: { color: '#0F172A', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 15, marginTop: 8, marginBottom: 24 }, link: { color: '#2563EB', fontWeight: '600' },
  footer: { color: '#64748B', textAlign: 'center', marginTop: 22 },
});
