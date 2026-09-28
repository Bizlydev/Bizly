import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function AppLoader({ message = 'Loading…' }: { message?: string }) {
  return <View accessibilityRole="progressbar" style={styles.container}><ActivityIndicator size="large" color="#2563EB" /><Text style={styles.message}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  message: { color: '#64748B', fontSize: 14 },
});
