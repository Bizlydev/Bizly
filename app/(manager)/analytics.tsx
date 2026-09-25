import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

type Period = 'daily' | 'weekly' | 'monthly';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { workspace } = useWorkspace();
  const [period, setPeriod] = useState<Period>('daily');
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (workspace) loadStats();
  }, [workspace, period]);

  function getStartDate() {
    const now = new Date();
    if (period === 'daily') return now.toISOString().split('T')[0];
    if (period === 'weekly') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d.toISOString().split('T')[0];
    }
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  }

  async function loadStats() {
    const startDate = getStartDate();
    const { data } = await supabase
      .from('sales')
      .select('amount')
      .eq('workspace_id', workspace!.id)
      .gte('date', startDate);

    const sales = data || [];
    setTotal(sales.reduce((sum, s) => sum + Number(s.amount), 0));
    setCount(sales.length);
  }

  const periods: { key: Period; label: string }[] = [
    { key: 'daily', label: 'روزانه' },
    { key: 'weekly', label: 'هفتگی' },
    { key: 'monthly', label: 'ماهانه' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        تحلیل فروش
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            onPress={() => setPeriod(p.key)}
            style={{
              backgroundColor: period === p.key ? colors.primary : colors.surface,
              borderRadius: radius.full,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              marginLeft: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: period === p.key ? '#FFF' : colors.text }}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.textSecondary }}>مجموع فروش</Text>
        <Text style={{ color: colors.text, ...typography.title }}>{total.toLocaleString()}</Text>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.textSecondary }}>تعداد فروش</Text>
        <Text style={{ color: colors.text, ...typography.title }}>{count}</Text>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.textSecondary }}>میانگین هر فروش</Text>
        <Text style={{ color: colors.text, ...typography.title }}>
          {count > 0 ? Math.round(total / count).toLocaleString() : 0}
        </Text>
      </View>
    </View>
  );
}