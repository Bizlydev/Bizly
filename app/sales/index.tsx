import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function AllSalesScreen() {
  const { colors } = useTheme();
  const { workspace } = useWorkspace();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    if (workspace) loadSales();
  }, [workspace]);

  async function loadSales() {
    const { data } = await supabase
      .from('sales')
      .select('*, profiles(first_name, last_name)')
      .eq('workspace_id', workspace!.id)
      .order('date', { ascending: false })
      .order('time', { ascending: true });
    setSales(data || []);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        کل فروش‌ها
      </Text>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textSecondary, width: 24 }}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, ...typography.body }}>{item.product}</Text>
              <Text style={{ color: colors.textSecondary, ...typography.small }}>
                {item.profiles?.first_name} {item.profiles?.last_name} · {item.time}
              </Text>
            </View>
            <Text style={{ color: colors.text, ...typography.subtitle }}>
              {Number(item.amount).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>هنوز فروشی ثبت نشده</Text>
        }
      />
    </View>
  );
}