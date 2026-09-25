import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function MyHoursScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { workspace } = useWorkspace();
  const [records, setRecords] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (profile) loadRecords();
  }, [profile]);

  async function loadRecords() {
    const { data } = await supabase
      .from('work_hours')
      .select('*')
      .eq('employee_id', profile!.id)
      .order('date', { ascending: false });
    setRecords(data || []);
  }

  function clockIn() {
    setStartTime(new Date());
  }

  async function clockOut() {
    if (!startTime) return;
    const end = new Date();
    const totalHours = (end.getTime() - startTime.getTime()) / 1000 / 60 / 60;

    await supabase.from('work_hours').insert({
      workspace_id: workspace!.id,
      employee_id: profile!.id,
      date: startTime.toISOString().split('T')[0],
      start_time: startTime.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      total_hours: Math.round(totalHours * 100) / 100,
    });

    setStartTime(null);
    loadRecords();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        ساعت کاری
      </Text>

      <TouchableOpacity
        onPress={startTime ? clockOut : clockIn}
        style={{
          backgroundColor: startTime ? colors.danger : colors.primary,
          borderRadius: radius.md,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Text style={{ color: '#FFF', ...typography.title }}>
          {startTime ? 'پایان کار' : 'شروع کار'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text }}>{item.date}</Text>
            <Text style={{ color: colors.textSecondary }}>{item.start_time} - {item.end_time}</Text>
            <Text style={{ color: colors.primaryLight, ...typography.subtitle }}>{item.total_hours} ساعت</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>هنوز ساعتی ثبت نشده</Text>
        }
      />
    </View>
  );
}