import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function SettingsScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.lg }}>
        تنظیمات
      </Text>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{ color: colors.text, flex: 1 }}>حالت تیره</Text>
        <Switch value={mode === 'dark'} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(manager)/employees')}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text }}>مدیریت کارمندها</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/about')}
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text }}>درباره برنامه</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={signOut}
        style={{
          backgroundColor: colors.danger,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#FFF', ...typography.subtitle }}>خروج از حساب</Text>
      </TouchableOpacity>
    </View>
  );
}