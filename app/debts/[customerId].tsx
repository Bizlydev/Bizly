import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

export default function CustomerDebtScreen() {
  const { colors } = useTheme();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  useEffect(() => {
    loadData();
  }, [customerId]);

  async function loadData() {
    const { data: cust } = await supabase.from('customers').select('*').eq('id', customerId).single();
    setCustomer(cust);

    const { data: txs } = await supabase
      .from('debt_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    setTransactions(txs || []);
  }

  async function submitPayment(tx: any) {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    const newPaid = Number(tx.paid_amount) + amount;
    const newRemaining = Math.max(Number(tx.amount) - newPaid, 0);
    await supabase
      .from('debt_transactions')
      .update({ paid_amount: newPaid, remaining: newRemaining })
      .eq('id', tx.id);
    setPayingId(null);
    setPayAmount('');
    loadData();
  }

  const totalRemaining = transactions.reduce((sum, t) => sum + Number(t.remaining), 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <Text style={{ ...typography.title, color: colors.text }}>
        {customer?.first_name} {customer?.last_name}
      </Text>
      <Text style={{ color: colors.danger, ...typography.subtitle, marginBottom: spacing.lg }}>
        مانده کل: {totalRemaining.toLocaleString()}
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
            <Text style={{ color: colors.text, ...typography.body }}>{item.product}</Text>
            <Text style={{ color: colors.textSecondary, ...typography.small, marginTop: spacing.xs }}>
              {item.date} · مبلغ: {Number(item.amount).toLocaleString()} · پرداخت‌شده: {Number(item.paid_amount).toLocaleString()}
            </Text>
            <Text style={{ color: colors.danger, ...typography.small }}>
              مانده: {Number(item.remaining).toLocaleString()}
            </Text>

            {Number(item.remaining) > 0 && (
              payingId === item.id ? (
                <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
                  <TextInput
                    placeholder="مبلغ پرداختی"
                    placeholderTextColor={colors.textSecondary}
                    value={payAmount}
                    onChangeText={setPayAmount}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderRadius: radius.sm,
                      padding: spacing.sm,
                      marginLeft: spacing.sm,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => submitPayment(item)}
                    style={{ backgroundColor: colors.success, borderRadius: radius.sm, padding: spacing.sm, justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#FFF' }}>ثبت</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setPayingId(item.id)} style={{ marginTop: spacing.sm }}>
                  <Text style={{ color: colors.primaryLight }}>+ ثبت پرداخت</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      />
    </View>
  );
}