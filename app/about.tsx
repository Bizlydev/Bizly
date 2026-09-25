import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { typography, spacing, radius } from '../constants/theme';
import { appInfo } from '../constants/appInfo';

export default function AboutScreen() {
  const { colors } = useTheme();
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    const { error } = await supabase.from('workspaces').select('id').limit(1);
    setConnected(!error);
  }

  const rows = [
    { label: 'نام برنامه', value: appInfo.name },
    { label: 'نسخه', value: appInfo.version },
    { label: 'سازنده', value: appInfo.developer },
    { label: 'تیم', value: appInfo.team },
    { label: 'سمت', value: appInfo.role },
    { label: 'تاریخ انتشار این نسخه', value: appInfo.releaseDate },
    {
      label: 'وضعیت اتصال',
      value: connected === null ? 'در حال بررسی...' : connected ? 'متصل' : 'قطع',
      color: connected === null ? colors.textSecondary : connected ? colors.success : colors.danger,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        درباره برنامه
      </Text>

      {rows.map((row, i) => (
        <View
          key={i}
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
          <Text style={{ color: colors.textSecondary, ...typography.body }}>{row.label}</Text>
          <Text style={{ color: row.color || colors.text, ...typography.body }}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}