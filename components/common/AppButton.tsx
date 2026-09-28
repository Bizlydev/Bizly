import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<PressableProps> & { loading?: boolean; variant?: 'primary' | 'secondary' | 'danger' };

export function AppButton({ children, loading = false, disabled, variant = 'primary', style, ...props }: Props) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, (disabled || loading) && styles.disabled, typeof style === 'function' ? style({ pressed }) : style]} {...props}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#2563EB'} /> : <Text style={[styles.label, variant !== 'primary' && styles.secondaryLabel]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#2563EB' }, secondary: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }, danger: { backgroundColor: '#FEE2E2' },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }, secondaryLabel: { color: '#1D4ED8' },
  pressed: { opacity: 0.82 }, disabled: { opacity: 0.55 },
});
