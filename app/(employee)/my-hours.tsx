import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
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
  const [activeRecord, setActiveRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    loadRecords();
  }, [profile]);

  async function loadRecords() {
    if (!profile) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('work_hours')
      .select('*')
      .eq('employee_id', profile.id)
      .order('date', { ascending: false });
    if (error) {
      Alert.alert('خطا', 'دریافت سوابق ساعت کاری ناموفق بود.');
    } else {
      const all = data || [];
      setRecords(all);
      setActiveRecord(all.find((item) => !item.end_time) || null);
    }
    setLoading(false);
  }

  async function clockIn() {
    if (!profile || !workspace || saving) return;
    setSaving(true);
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase.from('work_hours').insert({
      workspace_id: workspace.id,
      employee_id: profile.id,
      date,
      start_time: now.toTimeString().slice(0, 5),
      end_time: null,
      total_hours: null,
    }).select().single();
    setSaving(false);
    if (error) {
      Alert.alert('خطا', 'ثبت ساعت شروع کار در سرور انجام نشد.');
      return;
    }
    setActiveRecord(data);
    setRecords((previous) => [data, ...previous]);
  }

  async function clockOut() {
    if (!activeRecord || saving) return;
    setSaving(true);
    const end = new Date();
    const [hours, minutes] = String(activeRecord.start_time).slice(0, 5).split(':').map(Number);
    const start = new Date(activeRecord.date + 'T00:00:00');
    start.setHours(hours, minutes, 0, 0);
    const totalHours = Math.max(0, (end.getTime() - start.getTime()) / 3600000);
    const { data, error } = await supabase.from('work_hours').update({
      end_time: end.toTimeString().slice(0, 5),
      total_hours: Math.round(totalHours * 100) / 100,
    }).eq('id', activeRecord.id).select().single();
    setSaving(false);
    if (error) {
      Alert.alert('خطا', 'ثبت ساعت پایان کار انجام نشد. زمان شروع در سرور باقی مانده است.');
      return;
    }
    setActiveRecord(null);
    setRecords((previous) => previous.map((item) => item.id === data.id ? data : item));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>ساعت کاری</Text>
      <TouchableOpacity
        onPress={activeRecord ? clockOut : clockIn}
        disabled={loading || saving}
        style={{
          backgroundColor: activeRecord ? colors.danger : colors.primary,
          borderRadius: radius.md,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.lg,
          opacity: loading || saving ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#FFF', ...typography.title }}>
          {loading ? 'در حال بارگذاری...' : saving ? 'در حال ذخیره...' : activeRecord ? 'پایان کار' : 'شروع کار'}
        </Text>
      </TouchableOpacity>
      {activeRecord && (
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' }}>
          شروع کار: {String(activeRecord.start_time).slice(0, 5)}
        </Text>
      )}
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text }}>{item.date}</Text>
            <Text style={{ color: colors.textSecondary }}>{String(item.start_time).slice(0, 5)} - {item.end_time ? String(item.end_time).slice(0, 5) : 'در حال کار'}</Text>
            <Text style={{ color: colors.primaryLight, ...typography.subtitle }}>{item.total_hours == null ? '—' : `${item.total_hours} ساعت`}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{loading ? 'در حال دریافت سوابق...' : 'هنوز ساعتی ثبت نشده'}</Text>}
      />
    </View>
  );
}
