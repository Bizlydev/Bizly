import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

type Mode = 'employee' | 'manager';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('employee');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    Animated.timing(slideAnim, {
      toValue: newMode === 'employee' ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  async function handleRegister() {
    setError('');
    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !signUpData.user) {
      setLoading(false);
      setError(signUpError?.message || 'خطا در ثبت‌نام');
      return;
    }

    const userId = signUpData.user.id;

    if (mode === 'manager') {
      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ name: businessName, address, manager_id: userId })
        .select()
        .single();

      if (wsError || !workspace) {
        setLoading(false);
        setError('خطا در ساخت کسب‌وکار');
        return;
      }

      await supabase.from('profiles').insert({
        id: userId,
        workspace_id: workspace.id,
        role: 'manager',
        status: 'approved',
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
      });
    } else {
      await supabase.from('profiles').insert({
        id: userId,
        workspace_id: null,
        role: 'employee',
        status: 'pending',
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
      });
    }

    setLoading(false);
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.xl, textAlign: 'center' }}>
        ساخت حساب کاربری
      </Text>

      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.full,
        padding: 4,
        marginBottom: spacing.xl,
        position: 'relative',
      }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            width: '50%',
            backgroundColor: colors.primary,
            borderRadius: radius.full,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }).interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) as any,
            }],
          }}
        />
        <TouchableOpacity
          onPress={() => switchMode('employee')}
          style={{ flex: 1, padding: spacing.sm, alignItems: 'center', zIndex: 1 }}
        >
          <Text style={{ color: mode === 'employee' ? '#FFF' : colors.textSecondary, ...typography.subtitle }}>
            ثبت‌نام کارمند
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => switchMode('manager')}
          style={{ flex: 1, padding: spacing.sm, alignItems: 'center', zIndex: 1 }}
        >
          <Text style={{ color: mode === 'manager' ? '#FFF' : colors.textSecondary, ...typography.subtitle }}>
            ثبت‌نام مدیر
          </Text>
        </TouchableOpacity>
      </View>

      {[
        { placeholder: 'نام', value: firstName, onChange: setFirstName },
        { placeholder: 'نام خانوادگی', value: lastName, onChange: setLastName },
        { placeholder: 'ایمیل', value: email, onChange: setEmail },
        { placeholder: 'شماره تماس', value: phone, onChange: setPhone },
      ].map((field, i) => (
        <TextInput
          key={i}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textSecondary}
          value={field.value}
          onChangeText={field.onChange}
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
      ))}

      {mode === 'manager' && (
        <>
          <TextInput
            placeholder="نام کسب‌وکار"
            placeholderTextColor={colors.textSecondary}
            value={businessName}
            onChangeText={setBusinessName}
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
          <TextInput
            placeholder="آدرس محل کسب‌وکار"
            placeholderTextColor={colors.textSecondary}
            value={address}
            onChangeText={setAddress}
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
        </>
      )}

      {mode === 'employee' && (
        <TouchableOpacity
          onPress={() => router.push('/(auth)/select-workspace')}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textSecondary }}>انتخاب کسب‌وکار (به‌زودی)</Text>
        </TouchableOpacity>
      )}

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
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <TextInput
        placeholder="تکرار رمز عبور"
        placeholderTextColor={colors.textSecondary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />

      {error ? (
        <Text style={{ color: colors.danger, marginBottom: spacing.md, textAlign: 'center' }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleRegister}
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
          {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}