import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';
import type { Sale } from '../../types';

export default function MySalesScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (profile) loadSales();
  }, [profile]);

  async function loadSales() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('sales')
      .select('*')
      .eq('employee_id', profile!.id)
      .eq('date', today)
      .order('time', { ascending: true });
    setSales((data as Sale[]) || []);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        فروش‌های امروز
      </Text>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
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
            <Text style={{ color: colors.text, flex: 1, ...typography.body }}>{item.product}</Text>
            <Text style={{ color: colors.textSecondary, ...typography.small, marginHorizontal: spacing.sm }}>
              {item.time}
            </Text>
            <Text style={{ color: colors.text, ...typography.subtitle }}>
              {Number(item.amount).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl }}>
            هنوز فروشی ثبت نشده
          </Text>
        }
      />

      <TouchableOpacity
        onPress={() => router.push('/sales/new')}
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.full,
          padding: spacing.md,
          alignItems: 'center',
          marginTop: spacing.md,
        }}
      >
        <Text style={{ color: '#FFFFFF', ...typography.subtitle }}>+ ثبت فروش جدید</Text>
      </TouchableOpacity>
    </View>
  );
}