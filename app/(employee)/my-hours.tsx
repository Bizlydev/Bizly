import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [loading, setLoading] = useState(true);
  const storageKey = profile ? `work-hours-start-${profile.id}` : null;

  useEffect(() => {
    if (!profile || !storageKey) return;
    let active = true;

    async function initialize() {
      setLoading(true);
      const [storedStart, result] = await Promise.all([
        AsyncStorage.getItem(storageKey!),
        supabase
          .from('work_hours')
          .select('*')
          .eq('employee_id', profile!.id)
          .order('date', { ascending: false }),
      ]);

      if (!active) return;
      if (storedStart) {
        const parsed = new Date(storedStart);
        if (!Number.isNaN(parsed.getTime())) setStartTime(parsed);
        else await AsyncStorage.removeItem(storageKey!);
      }
      if (result.error) {
        Alert.alert('خطا', 'دریافت سوابق ساعت کاری ناموفق بود.');
      } else {
        setRecords(result.data || []);
      }
      setLoading(false);
    }

    initialize().catch(() => {
      if (active) {
        setLoading(false);
        Alert.alert('خطا', 'بازیابی ساعت شروع کار ناموفق بود.');
      }
    });

    return () => { active = false; };
  }, [profile, storageKey]);

  async function clockIn() {
    if (!storageKey) return;
    const now = new Date();
    try {
      await AsyncStorage.setItem(storageKey, now.toISOString());
      setStartTime(now);
    } catch {
      Alert.alert('خطا', 'ذخیره ساعت شروع کار ناموفق بود. دوباره تلاش کنید.');
    }
  }

  async function clockOut() {
    if (!startTime || !profile || !workspace || !storageKey) return;
    const end = new Date();
    const totalHours = (end.getTime() - startTime.getTime()) / 1000 / 60 / 60;
    const localDate = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, '0')}-${String(startTime.getDate()).padStart(2, '0')}`;

    const { error } = await supabase.from('work_hours').insert({
      workspace_id: workspace.id,
      employee_id: profile.id,
      date: localDate,
      start_time: startTime.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      total_hours: Math.round(totalHours * 100) / 100,
    });

    if (error) {
      Alert.alert('خطا', 'ثبت ساعت پایان کار انجام نشد. زمان شروع حفظ شده است؛ دوباره تلاش کنید.');
      return;
    }

    try {
      await AsyncStorage.removeItem(storageKey);
      setStartTime(null);
      const { data, error: loadError } = await supabase
        .from('work_hours')
        .select('*')
        .eq('employee_id', profile.id)
        .order('date', { ascending: false });
      if (!loadError) setRecords(data || []);
    } catch {
      Alert.alert('توجه', 'ساعت کاری ثبت شد، اما پاک‌سازی زمان شروع از حافظه گوشی انجام نشد.');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        ساعت کاری
      </Text>

      <TouchableOpacity
        onPress={startTime ? clockOut : clockIn}
        disabled={loading}
        style={{
          backgroundColor: startTime ? colors.danger : colors.primary,
          borderRadius: radius.md,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.lg,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#FFF', ...typography.title }}>
          {loading ? 'در حال بارگذاری...' : startTime ? 'پایان کار' : 'شروع کار'}
        </Text>
      </TouchableOpacity>

      {startTime && (
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' }}>
          شروع کار: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}

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
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {loading ? 'در حال دریافت سوابق...' : 'هنوز ساعتی ثبت نشده'}
          </Text>
        }
      />
    </View>
  );
}
