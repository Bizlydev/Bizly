import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & { label: string; error?: string };

export function AppInput({ label, error, secureTextEntry, style, ...props }: Props) {
  const [secure, setSecure] = useState(Boolean(secureTextEntry));
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor="#94A3B8" {...props} secureTextEntry={secure} style={[styles.input, error && styles.invalid, style]} />
      {secureTextEntry ? <Text accessibilityRole="button" onPress={() => setSecure(value => !value)} style={styles.toggle}>{secure ? 'Show' : 'Hide'} password</Text> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7, marginBottom: 16 }, label: { color: '#334155', fontSize: 14, fontWeight: '600' },
  input: { minHeight: 50, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: 16 },
  invalid: { borderColor: '#DC2626' }, error: { color: '#DC2626', fontSize: 12 }, toggle: { color: '#2563EB', alignSelf: 'flex-end', paddingVertical: 4 },
});
