import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
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
  const [activeHours, setActiveHours] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (workspace) loadStats();
  }, [workspace]);

  async function loadStats() {
    if (!workspace) return;
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const { data: sales } = await supabase.from('sales').select('amount').eq('workspace_id', workspace.id).eq('date', todayString);
    setTodaySales((sales || []).reduce((sum, s) => sum + Number(s.amount), 0));

    const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('workspace_id', workspace.id).eq('status', 'pending');
    setPendingCount(count || 0);

    const { data: debts } = await supabase.from('debt_transactions').select('remaining').eq('workspace_id', workspace.id);
    setDebtTotal((debts || []).reduce((sum, d) => sum + Number(d.remaining), 0));

    const { data: hours, error } = await supabase
      .from('work_hours')
      .select('id, employee_id, date, start_time')
      .eq('workspace_id', workspace.id)
      .is('end_time', null)
      .order('start_time', { ascending: true });
    if (!error) setActiveHours(hours || []);
  }

  const cards = [
    { label: 'فروش امروز', value: todaySales.toLocaleString() },
    { label: 'بدهی باز', value: debtTotal.toLocaleString() },
    { label: 'درخواست‌های در انتظار', value: pendingCount },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadStats(); setRefreshing(false); }} />}
    >
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>{workspace?.name || 'داشبورد'}</Text>
      {cards.map((card, i) => (
        <View key={i} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textSecondary, ...typography.body, marginBottom: spacing.xs }}>{card.label}</Text>
          <Text style={{ color: colors.text, ...typography.title }}>{card.value}</Text>
        </View>
      ))}
      <Text style={{ ...typography.subtitle, color: colors.text, marginTop: spacing.md, marginBottom: spacing.md }}>کارمندان در حال کار</Text>
      {activeHours.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>در حال حاضر کارمندی در حال کار ثبت نشده است.</Text>
      ) : activeHours.map((item) => (
        <View key={item.id} style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text }}>شناسه کارمند: {item.employee_id}</Text>
          <Text style={{ color: colors.textSecondary }}>تاریخ: {item.date} — شروع: {String(item.start_time).slice(0, 5)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
