import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function EmployeeTasksScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [doneTaskIds, setDoneTaskIds] = useState<string[]>([]);

  useEffect(() => {
    if (profile) loadTasks();
  }, [profile]);

  async function loadTasks() {
    const { data: taskList } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', profile!.id);
    setTasks(taskList || []);

    const today = new Date().toISOString().split('T')[0];
    const { data: comps } = await supabase
      .from('task_completions')
      .select('task_id')
      .eq('employee_id', profile!.id)
      .eq('date', today);
    setDoneTaskIds((comps || []).map((c) => c.task_id));
  }

  async function toggleTask(task: any) {
    if (task.is_recurring) {
      if (doneTaskIds.includes(task.id)) return;
      await supabase.from('task_completions').insert({
        task_id: task.id,
        employee_id: profile!.id,
      });
    } else {
      await supabase.from('tasks').update({ status: 'done' }).eq('id', task.id);
    }
    loadTasks();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        وظایف امروز
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const done = item.is_recurring ? doneTaskIds.includes(item.id) : item.status === 'done';
          return (
            <TouchableOpacity
              onPress={() => toggleTask(item)}
              disabled={done}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
                borderWidth: 1,
                borderColor: done ? colors.success : colors.border,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: radius.sm,
                  borderWidth: 2,
                  borderColor: done ? colors.success : colors.textSecondary,
                  backgroundColor: done ? colors.success : 'transparent',
                  marginLeft: spacing.md,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: colors.text,
                  ...typography.body,
                  textDecorationLine: done ? 'line-through' : 'none',
                }}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.textSecondary, ...typography.small }}>
                  {item.is_recurring ? 'روزانه' : 'یک‌باره'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>وظیفه‌ای برای شما ثبت نشده</Text>
        }
      />
    </View>
  );
}