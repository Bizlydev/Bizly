import { StyleSheet, Text, View } from 'react-native';

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.container}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 4 },
  title: { fontSize: 26, fontWeight: '700', color: '#0F172A' }, subtitle: { fontSize: 14, color: '#64748B' },
});
