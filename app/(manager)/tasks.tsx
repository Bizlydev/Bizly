import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Switch, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function ManagerTasksScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { workspace } = useWorkspace();
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) loadData();
  }, [workspace]);

  async function loadData() {
    const { data: emps } = await supabase
      .from('profiles')
      .select('*')
      .eq('workspace_id', workspace!.id)
      .eq('role', 'employee')
      .eq('status', 'approved');
    setEmployees(emps || []);

    const { data: taskList } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspace!.id)
      .order('created_at', { ascending: false });
    setTasks(taskList || []);

    const today = new Date().toISOString().split('T')[0];
    const { data: comps } = await supabase
      .from('task_completions')
      .select('*')
      .eq('date', today);
    setCompletions(comps || []);
  }

  async function createTask() {
    if (!title || !selectedEmployee) return;
    await supabase.from('tasks').insert({
      workspace_id: workspace!.id,
      title,
      assigned_to: selectedEmployee,
      is_recurring: isRecurring,
      created_by: profile!.id,
    });
    setTitle('');
    loadData();
  }

  function employeeName(id: string) {
    const e = employees.find((emp) => emp.id === id);
    return e ? `${e.first_name} ${e.last_name}` : '—';
  }

  function isDoneToday(taskId: string) {
    return completions.some((c) => c.task_id === taskId);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        وظایف
      </Text>

      <TextInput
        placeholder="عنوان وظیفه جدید"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={{ color: colors.text, flex: 1 }}>تکرار روزانه</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        {employees.map((emp) => (
          <TouchableOpacity
            key={emp.id}
            onPress={() => setSelectedEmployee(emp.id)}
            style={{
              backgroundColor: selectedEmployee === emp.id ? colors.primary : colors.surface,
              borderRadius: radius.full,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              marginRight: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: selectedEmployee === emp.id ? '#FFF' : colors.text }}>
              {emp.first_name} {emp.last_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={createTask}
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <Text style={{ color: '#FFF', ...typography.subtitle }}>+ ساخت وظیفه</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const done = item.is_recurring ? isDoneToday(item.id) : item.status === 'done';
          return (
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
              <Text style={{ color: colors.text, ...typography.subtitle }}>{item.title}</Text>
              <Text style={{ color: colors.textSecondary, ...typography.small, marginTop: spacing.xs }}>
                {employeeName(item.assigned_to)} · {item.is_recurring ? 'روزانه' : 'یک‌باره'}
              </Text>
              <Text style={{ color: done ? colors.success : colors.warning, ...typography.small, marginTop: spacing.xs }}>
                {done ? 'انجام شده (امروز)' : 'انجام نشده'}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>هنوز وظیفه‌ای ساخته نشده</Text>
        }
      />
    </View>
  );
}