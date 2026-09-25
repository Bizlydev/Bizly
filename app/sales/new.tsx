import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function NewSaleScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { workspace } = useWorkspace();
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!product || !amount) return;
    setLoading(true);
    const now = new Date();
    await supabase.from('sales').insert({
      workspace_id: workspace!.id,
      employee_id: profile!.id,
      product,
      amount: Number(amount),
      time: now.toTimeString().slice(0, 5),
      date: now.toISOString().split('T')[0],
    });
    setLoading(false);
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' }}>
      <Text style={{ ...typography.title, color: colors.text, marginBottom: spacing.xl, textAlign: 'center' }}>
        ثبت فروش جدید
      </Text>

      <TextInput
        placeholder="نام محصول یا خدمت"
        placeholderTextColor={colors.textSecondary}
        value={product}
        onChangeText={setProduct}
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

      <TextInput
        placeholder="مبلغ"
        placeholderTextColor={colors.textSecondary}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          padding: spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#FFF', ...typography.subtitle }}>
          {loading ? 'در حال ثبت...' : 'ثبت فروش'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}