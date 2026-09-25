import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function DebtsListScreen() {
  const { colors } = useTheme();
  const { workspace } = useWorkspace();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (workspace) loadCustomers();
  }, [workspace]);

  async function loadCustomers() {
    const { data: custs } = await supabase
      .from('customers')
      .select('*')
      .eq('workspace_id', workspace!.id);

    const { data: debts } = await supabase
      .from('debt_transactions')
      .select('customer_id, remaining, is_pinned')
      .eq('workspace_id', workspace!.id);

    const withTotals = (custs || []).map((c) => {
      const custDebts = (debts || []).filter((d) => d.customer_id === c.id);
      const remaining = custDebts.reduce((sum, d) => sum + Number(d.remaining), 0);
      const pinned = custDebts.some((d) => d.is_pinned);
      return { ...c, remaining, pinned };
    }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.remaining - a.remaining);

    setCustomers(withTotals);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        بدهی مشتریان
      </Text>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/debts/${item.id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              borderWidth: 1,
              borderColor: item.pinned ? colors.warning : colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, ...typography.body }}>
                {item.first_name} {item.last_name}
              </Text>
              {item.phone ? (
                <Text style={{ color: colors.textSecondary, ...typography.small }}>{item.phone}</Text>
              ) : null}
            </View>
            <Text style={{
              color: item.remaining > 0 ? colors.danger : colors.success,
              ...typography.subtitle,
            }}>
              {item.remaining.toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>هنوز مشتری‌ای ثبت نشده</Text>
        }
      />
    </View>
  );
}