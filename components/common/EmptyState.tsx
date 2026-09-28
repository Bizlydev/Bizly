import { StyleSheet, Text, View } from 'react-native';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <View style={styles.container}><View style={styles.icon}><Text style={styles.symbol}>—</Text></View><Text style={styles.title}>{title}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  symbol: { color: '#2563EB', fontSize: 28, fontWeight: '600' }, title: { color: '#0F172A', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  description: { color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
