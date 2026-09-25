import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function EmployeesScreen() {
  const { colors } = useTheme();
  const { workspace } = useWorkspace();
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (workspace) loadEmployees();
  }, [workspace]);

  async function loadEmployees() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('workspace_id', workspace!.id)
      .eq('role', 'employee');
    setEmployees(data || []);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('profiles').update({ status }).eq('id', id);
    loadEmployees();
  }

  const statusLabel: Record<string, string> = {
    pending: 'در انتظار تأیید',
    approved: 'تأیید شده',
    rejected: 'رد شده',
  };
  const statusColor: Record<string, string> = {
    pending: colors.warning,
    approved: colors.success,
    rejected: colors.danger,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        کارمندها
      </Text>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, ...typography.body }}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={{ color: colors.textSecondary, ...typography.small }}>{item.phone}</Text>
            <Text style={{ color: statusColor[item.status], ...typography.small, marginTop: spacing.xs }}>
              {statusLabel[item.status]}
            </Text>

            {item.status === 'pending' && (
              <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
                <TouchableOpacity
                  onPress={() => updateStatus(item.id, 'approved')}
                  style={{ backgroundColor: colors.success, borderRadius: radius.sm, padding: spacing.sm, marginLeft: spacing.sm, flex: 1, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFF' }}>تأیید</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateStatus(item.id, 'rejected')}
                  style={{ backgroundColor: colors.danger, borderRadius: radius.sm, padding: spacing.sm, flex: 1, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFF' }}>رد</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>هنوز کارمندی ثبت نشده</Text>
        }
      />
    </View>
  );
}