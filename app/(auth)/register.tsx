import { useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen, Field, Btn, Card, Muted, ErrorText } from '../../components/ui';
import { radius, spacing, typography } from '../../constants/theme';

type Mode = 'employee' | 'manager';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('employee');
  const [segW, setSegW] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [wsQuery, setWsQuery] = useState('');
  const [wsResults, setWsResults] = useState<any[]>([]);
  const [ws, setWs] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const half = Math.max(segW / 2 - 4, 0);

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
    Animated.timing(slide, { toValue: m === 'employee' ? 0 : 1, duration: 220, useNativeDriver: true }).start();
  }

  async function searchWs(text: string) {
    setWsQuery(text);
    setWs(null);
    if (text.trim().length < 2) {
      setWsResults([]);
      return;
    }
    const { data } = await supabase.rpc('search_workspaces', { q: text.trim() });
    setWsResults(data || []);
  }

  async function handleRegister() {
    setError('');
    setInfo('');
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('نام، نام خانوادگی و ایمیل را وارد کنید');
      return;
    }
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (password !== confirm) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }
    if (mode === 'manager' && !businessName.trim()) {
      setError('نام کسب‌وکار را وارد کنید');
      return;
    }
    if (mode === 'employee' && !ws) {
      setError('کسب‌وکار خود را جست‌وجو و انتخاب کنید');
      return;
    }
    setLoading(true);
    const meta =
      mode === 'manager'
        ? { role: 'manager', first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim(), workspace_name: businessName.trim(), address: address.trim() }
        : { role: 'employee', first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim(), workspace_id: ws!.id };
    const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: meta } });
    setLoading(false);
    if (err) {
      setError('ثبت‌نام ناموفق: ' + err.message);
      return;
    }
    if (!data.session) {
      setInfo('حساب ساخته شد. ایمیل خود را تأیید کنید و سپس وارد شوید.');
      return;
    }
    router.replace('/');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen title="ساخت حساب کاربری">
        <View
          onLayout={(e) => setSegW(e.nativeEvent.layout.width)}
          style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full, padding: 4, marginBottom: spacing.lg }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              width: half,
              backgroundColor: colors.primary,
              borderRadius: radius.full,
              transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, half] }) }],
            }}
          />
          <TouchableOpacity onPress={() => switchMode('employee')} style={{ flex: 1, padding: spacing.sm, alignItems: 'center' }}>
            <Text style={{ color: mode === 'employee' ? '#FFF' : colors.textSecondary, ...typography.subtitle }}>ثبت‌نام کارمند</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => switchMode('manager')} style={{ flex: 1, padding: spacing.sm, alignItems: 'center' }}>
            <Text style={{ color: mode === 'manager' ? '#FFF' : colors.textSecondary, ...typography.subtitle }}>ثبت‌نام مدیر</Text>
          </TouchableOpacity>
        </View>

        <Field placeholder="نام" value={firstName} onChangeText={setFirstName} />
        <Field placeholder="نام خانوادگی" value={lastName} onChangeText={setLastName} />
        <Field placeholder="ایمیل" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field placeholder="شماره تماس" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        {mode === 'manager' ? (
          <>
            <Field placeholder="نام کسب‌وکار" value={businessName} onChangeText={setBusinessName} />
            <Field placeholder="آدرس کسب‌وکار" value={address} onChangeText={setAddress} />
          </>
        ) : (
          <>
            <Field placeholder="جست‌وجوی نام کسب‌وکار" value={wsQuery} onChangeText={searchWs} />
            {wsResults.map((r) => (
              <Card
                key={r.id}
                onPress={() => {
                  setWs({ id: r.id, name: r.name });
                  setWsQuery(r.name);
                  setWsResults([]);
                }}
              >
                <Text style={{ color: colors.text }}>{r.name}</Text>
                {r.address ? <Muted>{r.address}</Muted> : null}
              </Card>
            ))}
            {ws ? <Muted style={{ marginBottom: spacing.md, color: colors.success }}>کسب‌وکار انتخاب شد: {ws.name}</Muted> : null}
          </>
        )}

        <Field placeholder="رمز عبور" value={password} onChangeText={setPassword} secureTextEntry />
        <Field placeholder="تکرار رمز عبور" value={confirm} onChangeText={setConfirm} secureTextEntry />
        <ErrorText text={error} />
        {info ? <Text style={{ color: colors.success, textAlign: 'center', marginBottom: spacing.md }}>{info}</Text> : null}
        <Btn label={loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'} onPress={handleRegister} disabled={loading} />
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.primaryLight }}>حساب دارید؟ وارد شوید</Text>
        </TouchableOpacity>
      </Screen>
    </View>
  );
}
