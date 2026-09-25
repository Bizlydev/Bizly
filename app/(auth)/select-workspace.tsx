import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function SelectWorkspaceScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  async function search(text: string) {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    const { data } = await supabase
      .from('workspaces')
      .select('id, name, address')
      .ilike('name', `%${text}%`)
      .limit(10);
    setResults(data || []);
  }

  function select(item: any) {
    router.push({
      pathname: '/(auth)/register',
      params: { selectedWorkspaceId: item.id, selectedWorkspaceName: item.name },
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        جست‌وجوی کسب‌وکار
      </Text>

      <TextInput
        placeholder="نام کسب‌وکار را وارد کنید"
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={search}
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => select(item)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, ...typography.body }}>{item.name}</Text>
            {item.address ? (
              <Text style={{ color: colors.textSecondary, ...typography.small }}>{item.address}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length >= 2 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>کسب‌وکاری پیدا نشد</Text>
          ) : null
        }
      />
    </View>
  );
}