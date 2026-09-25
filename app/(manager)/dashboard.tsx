import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function ManagerDashboard() {
  const { colors } = useTheme();
  const { workspace } = useWorkspace();
  const [todaySales, setTodaySales] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [debtTotal, setDebtTotal] = useState(0);

  useEffect(() => {
    if (!workspace) return;
    loadStats();
  }, [workspace]);

  async function loadStats() {
    const today = new Date().toISOString().split('T')[0];

    const { data: sales } = await supabase
      .from('sales')
      .select('amount')
      .eq('workspace_id', workspace!.id)
      .eq('date', today);
    setTodaySales((sales || []).reduce((sum, s) => sum + Number(s.amount), 0));

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace!.id)
      .eq('status', 'pending');
    setPendingCount(count || 0);

    const { data: debts } = await supabase
      .from('debt_transactions')
      .select('remaining')
      .eq('workspace_id', workspace!.id);
    setDebtTotal((debts || []).reduce((sum, d) => sum + Number(d.remaining), 0));
  }

  const cards = [
    { label: 'فروش امروز', value: todaySales.toLocaleString() },
    { label: 'بدهی باز', value: debtTotal.toLocaleString() },
    { label: 'درخواست‌های در انتظار', value: pendingCount },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        {workspace?.name || 'داشبورد'}
      </Text>

      {cards.map((card, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textSecondary, ...typography.body, marginBottom: spacing.xs }}>
            {card.label}
          </Text>
          <Text style={{ color: colors.text, ...typography.title }}>
            {card.value}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}