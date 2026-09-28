import React from 'react';
import { ScrollView, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { radius, spacing, typography } from '../constants/theme';

export function Screen({ title, children }: { title?: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}
      keyboardShouldPersistTaps="handled"
    >
      {title ? <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>{title}</Text> : null}
      {children}
    </ScrollView>
  );
}

export function Card({ children, onPress, borderColor }: { children: React.ReactNode; onPress?: () => void; borderColor?: string }) {
  const { colors } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: borderColor || colors.border,
  };
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={base}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={base}>{children}</View>;
}

export function Field(props: TextInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      {...props}
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
  );
}

export function Btn({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'success' ? colors.success : colors.surface;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{
        backgroundColor: bg,
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginBottom: spacing.sm,
        opacity: disabled ? 0.6 : 1,
        borderWidth: variant === 'ghost' ? 1 : 0,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: variant === 'ghost' ? colors.text : '#FFFFFF', ...typography.subtitle }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Muted({ children, style }: { children: React.ReactNode; style?: any }) {
  const { colors } = useTheme();
  return <Text style={[{ color: colors.textSecondary, ...typography.small }, style]}>{children}</Text>;
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, style]}>{children}</View>;
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.primary : colors.surface,
        borderRadius: radius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
      }}
    >
      <Text style={{ color: active ? '#FFFFFF' : colors.text }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ErrorText({ text }: { text: string }) {
  const { colors } = useTheme();
  if (!text) return null;
  return <Text style={{ color: colors.danger, marginBottom: spacing.md, textAlign: 'center' }}>{text}</Text>;
}