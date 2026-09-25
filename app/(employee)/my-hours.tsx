import { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

function validTime(value: string) {
  return /^([01]\\d|2[0-3]):[0-5]\\d$/.test(value);
}

function durationHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return minutes / 60;
}

export default function MyHoursScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { workspace } = useWorkspace();
  const [records, setRecords] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const totalHours = useMemo(() => validTime(startTime) && validTime(endTime) ? durationHours(startTime, endTime) : null, [startTime, endTime]);

  async function loadRecords() {
    if (!profile) return;
    const { data, error } = await supabase.from('work_hours').select('*').eq('employee_id', profile.id).order('date', { ascending: false });
    if (error) Alert.alert('خطا', 'دریافت سوابق ساعت کاری ناموفق بود.');
    else setRecords(data || []);
    setLoading(false);
  }

  useEffect(() => { loadRecords(); }, [profile]);

  async function saveHours() {
    if (!profile || !workspace) return;
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || !validTime(startTime) || !validTime(endTime)) {
      Alert.alert('اطلاعات نامعتبر', 'تاریخ و ساعت ورود و خروج را با قالب صحیح وارد کنید (مثلاً 13:00 و 20:00).');
      return;
    }
    if (totalHours === null || totalHours <= 0) {
      Alert.alert('ساعت نامعتبر', 'ساعت خروج باید با ساعت ورود متفاوت باشد.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('work_hours').insert({
      workspace_id: workspace.id,
      employee_id: profile.id,
      date,
      start_time: startTime,
      end_time: endTime,
      total_hours: Math.round(totalHours * 100) / 100,
    });
    setSaving(false);
    if (error) {
      Alert.alert('خطا', 'ذخیره ساعت کاری انجام نشد. دسترسی یا ساختار جدول Supabase را بررسی کنید.');
      return;
    }
    Alert.alert('ثبت شد', `مجموع ساعت کاری: ${totalHours.toLocaleString('fa-IR')} ساعت`);
    setStartTime('');
    setEndTime('');
    await loadRecords();
  }

  const fieldStyle = { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, backgroundColor: colors.surface, textAlign: 'center' as const, fontSize: 16, flex: 1 };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>ثبت ساعت کاری</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>تاریخ (YYYY-MM-DD)</Text>
      <TextInput value={date} onChangeText={setDate} placeholder="2026-09-25" placeholderTextColor={colors.textSecondary} style={{ ...fieldStyle, flex: 0, marginBottom: spacing.md }} />
      <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>ساعت ورود و خروج (۲۴ ساعته)</Text>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <TextInput value={startTime} onChangeText={setStartTime} placeholder="ورود 13:00" placeholderTextColor={colors.textSecondary} keyboardType="numbers-and-punctuation" maxLength={5} style={fieldStyle} />
        <TextInput value={endTime} onChangeText={setEndTime} placeholder="خروج 20:00" placeholderTextColor={colors.textSecondary} keyboardType="numbers-and-punctuation" maxLength={5} style={fieldStyle} />
      </View>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.textSecondary }}>مجموع ساعت کاری</Text>
        <Text style={{ color: colors.primaryLight, ...typography.title }}>{totalHours === null ? '—' : `${totalHours.toLocaleString('fa-IR')} ساعت`}</Text>
      </View>
      <TouchableOpacity onPress={saveHours} disabled={saving} style={{ backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg, opacity: saving ? 0.6 : 1 }}>
        <Text style={{ color: '#FFF', ...typography.title }}>{saving ? 'در حال ذخیره...' : 'ذخیره ساعت کاری'}</Text>
      </TouchableOpacity>
      <Text style={{ ...typography.subtitle, color: colors.text, marginBottom: spacing.md }}>سوابق ساعت کاری</Text>
      <FlatList data={records} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text }}>{item.date}</Text>
          <Text style={{ color: colors.textSecondary }}>{item.start_time} - {item.end_time}</Text>
          <Text style={{ color: colors.primaryLight, ...typography.subtitle }}>{Number(item.total_hours).toLocaleString('fa-IR')} ساعت</Text>
        </View>
      )} ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{loading ? 'در حال دریافت سوابق...' : 'هنوز ساعتی ثبت نشده'}</Text>} />
    </View>
  );
}
