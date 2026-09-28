import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { useWorkspace } from '../../hooks/useWorkspace';

export default function SelectWorkspaceScreen() {
  const { setWorkspace } = useWorkspace();
  const [name, setName] = useState('');

  function continueToApp() {
    const cleanName = name.trim();
    if (!cleanName) return Alert.alert('Workspace name required', 'Enter the name of your workspace.');
    setWorkspace({ id: 'local-pending', name: cleanName, role: 'owner' });
    router.replace('/(app)/dashboard');
  }

  return <View style={styles.page}><Text style={styles.title}>Set up your workspace</Text><Text style={styles.subtitle}>Give your business workspace a name to continue.</Text>
    <AppInput label="Workspace name" value={name} onChangeText={setName} placeholder="My business" autoCapitalize="words" />
    <AppButton onPress={continueToApp}>Continue</AppButton>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 27, fontWeight: '800', color: '#0F172A' }, subtitle: { fontSize: 15, color: '#64748B', marginTop: 10, marginBottom: 26, lineHeight: 22 },
});
