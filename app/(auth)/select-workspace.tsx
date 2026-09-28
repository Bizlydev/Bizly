import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAuth } from '../../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type CreatedWorkspace = { workspace_id: string; workspace_name: string; member_role: 'manager' | 'employee' };

export default function SelectWorkspaceScreen() {
  const { setWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function continueToApp() {
    const cleanName = name.trim();
    if (cleanName.length < 2) return Alert.alert('Workspace name required', 'Enter a name with at least 2 characters.');
    if (!isSupabaseConfigured || !user) return Alert.alert('Sign in required', 'Sign in to create a workspace.');
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('create_workspace', { p_name: cleanName });
      if (error) throw error;
      const created = (Array.isArray(data) ? data[0] : data) as CreatedWorkspace | null;
      if (!created?.workspace_id) throw new Error('Workspace was not returned by the server.');
      setWorkspace({ id: created.workspace_id, name: created.workspace_name, role: created.member_role });
      router.replace('/(app)/dashboard');
    } catch (error) {
      Alert.alert('Unable to create workspace', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <View style={styles.page}><Text style={styles.title}>Set up your workspace</Text><Text style={styles.subtitle}>Create a real business workspace linked to your account.</Text>
    <AppInput label="Workspace name" value={name} onChangeText={setName} placeholder="My business" autoCapitalize="words" />
    <AppButton loading={busy} onPress={continueToApp}>Create workspace</AppButton>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 27, fontWeight: '800', color: '#0F172A' }, subtitle: { fontSize: 15, color: '#64748B', marginTop: 10, marginBottom: 26, lineHeight: 22 },
});
