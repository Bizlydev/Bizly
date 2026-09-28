import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useWorkspace } from '../../hooks/useWorkspace';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const palette = {
  light: { bg: '#F2F5FB', card: '#FFFFFF', panel: '#F8FAFF', text: '#17213B', muted: '#8490A8', line: '#E8EDF6', blue: '#4169F5', purple: '#8B63EF', green: '#19B88A', orange: '#F4AD4F' },
  dark: { bg: '#080D1A', card: '#111A2D', panel: '#17223A', text: '#EEF3FF', muted: '#94A3BF', line: '#25324B', blue: '#7393FF', purple: '#A18AFF', green: '#37D5A6', orange: '#FFBD67' },
};

type SaleRow = { id: string; amount: number | string; date: string; product: string | null; employee_id: string | null };
type DashboardData = { sales: SaleRow[]; customersCount: number; tasksCount: number; pendingTasks: number; role: string; error: string | null };
const emptyData: DashboardData = { sales: [], customersCount: 0, tasksCount: 0, pendingTasks: 0, role: 'employee', error: null };
const activityColors = ['#19B88A', '#4169F5', '#8B63EF'];

export default function DashboardScreen() {
  const { isDark, setMode } = useTheme();
  const { workspace, setWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      if (!isSupabaseConfigured || !user) {
        if (active) { setData({ ...emptyData, error: 'برای مشاهده اطلاعات واقعی، اتصال Supabase و ورود به حساب لازم است.' }); setLoading(false); }
        return;
      }
      setLoading(true);
      const profileResult = await supabase.from('profiles').select('id, workspace_id, role, first_name, last_name').eq('id', user.id).maybeSingle();
      if (profileResult.error || !profileResult.data?.workspace_id) {
        if (active) {
          setData({ ...emptyData, error: profileResult.error?.message || 'برای حساب شما فضای کاری ثبت نشده است.' });
          setLoading(false);
          if (!profileResult.error && !profileResult.data?.workspace_id) router.replace('/(auth)/select-workspace');
        }
        return;
      }
      const profile = profileResult.data;
      const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
      const [workspaceResult, salesResult, customersResult, tasksResult, pendingTasksResult] = await Promise.all([
        supabase.from('workspaces').select('id, name').eq('id', profile.workspace_id).maybeSingle(),
        supabase.from('sales').select('id, amount, date, product, employee_id').gte('date', start.toISOString().slice(0, 10)).order('date', { ascending: false }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      if (!active) return;
      const errors = [salesResult.error, customersResult.error, tasksResult.error, pendingTasksResult.error].filter(Boolean);
      setData({ sales: salesResult.data || [], customersCount: customersResult.count || 0, tasksCount: tasksResult.count || 0, pendingTasks: pendingTasksResult.count || 0, role: profile.role || 'employee', error: errors.length ? 'برخی اطلاعات به دلیل محدودیت دسترسی یا خطای اتصال بارگذاری نشدند.' : null });
      if (workspaceResult.data) setWorkspace({ id: workspaceResult.data.id, name: workspaceResult.data.name, role: profile.role || 'employee' });
      setLoading(false);
    }
    void loadDashboard();
    return () => { active = false; };
  }, [user?.id, setWorkspace]);

  const managerView = data.role === 'manager';
  const totalSales = data.sales.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const salesChart = Array.from({ length: 12 }, (_, index) => {
    const monthLength = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const value = data.sales.filter((sale) => Math.min(11, Math.floor(((new Date(`${sale.date}T00:00:00`).getDate() - 1) / monthLength) * 12)) === index).reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    return value;
  });
  const maxChart = Math.max(1, ...salesChart);
  const activities = data.sales.slice(0, 3).map((sale, index) => ({ icon: '＋', title: 'فروش ثبت‌شده', detail: `${sale.product || 'فروش'} · ${sale.date}`, amount: `${Number(sale.amount || 0).toLocaleString('fa-IR')} تومان`, color: activityColors[index % activityColors.length] }));
  const { width } = useWindowDimensions();
  const c = isDark ? palette.dark : palette.light;
  const isManager = managerView;
  const isNarrow = width < 390;
  const styles = useMemo(() => createStyles(c, isNarrow), [c, isNarrow]);

  const stats = [
    ...(isManager ? [{ label: 'مجموع فروش', value: totalSales.toLocaleString('fa-IR'), unit: 'تومان', note: loading ? 'در حال بارگذاری…' : 'فروش ثبت‌شده این ماه', icon: '↗', color: '#4169F5', tint: '#7894FF' }] : []),
    { label: isManager ? 'فروش‌ها' : 'فروش‌های من', value: data.sales.length.toLocaleString('fa-IR'), unit: 'ثبت‌شده', note: loading ? 'در حال بارگذاری…' : 'از ابتدای ماه', icon: '▤', color: '#8B63EF', tint: '#B08CFF' },
    { label: isManager ? 'مشتریان' : 'وظایف من', value: (isManager ? data.customersCount : data.tasksCount).toLocaleString('fa-IR'), unit: isManager ? 'مشتری' : 'وظیفه', note: loading ? 'در حال بارگذاری…' : (isManager ? 'مشتریان فضای کاری' : 'وظایف اختصاص‌یافته'), icon: '♙', color: '#19B88A', tint: '#50DDB0' },
    { label: 'در انتظار', value: data.pendingTasks.toLocaleString('fa-IR'), unit: 'وظیفه', note: loading ? 'در حال بارگذاری…' : 'وظایف باز', icon: '◷', color: '#F4AD4F', tint: '#FFD17B' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <View style={styles.brandRow}>
            <View style={styles.logo}><Text style={styles.logoText}>B</Text></View>
            <View><Text style={styles.brand}>Bizly</Text><Text style={styles.brandSub}>مدیریت هوشمند کسب‌وکار</Text></View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="تغییر حالت نمایش" onPress={() => setMode(isDark ? 'light' : 'dark')} style={styles.themeButton}>
            <Text style={styles.themeIcon}>{isDark ? '☀' : '☾'}</Text>
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>داشبورد کسب‌وکار</Text>
            <Text style={styles.heading}>سلام، خوش آمدید 👋</Text>
            <Text style={styles.subheading}>{workspace?.name || 'نمای کلی فعالیت‌های امروز شما'}</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>ب</Text></View>
        </View>

        <View style={styles.toolbar}>
          <View><Text style={styles.sectionTitle}>خلاصه عملکرد</Text><Text style={styles.muted}>{loading ? 'در حال دریافت اطلاعات…' : data.error || 'اطلاعات از فضای کاری شما دریافت می‌شود'}</Text></View>
          <View style={styles.period}><Text style={styles.periodText}>این ماه⌄</Text></View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={styles.statTop}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <View style={[styles.statIcon, { backgroundColor: item.color, shadowColor: item.color }]}><Text style={styles.statIconText}>{item.icon}</Text></View>
              </View>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
              <Text style={styles.statUnit}>{item.unit}</Text>
              <Text style={[styles.statNote, { color: item.note.startsWith('↑') ? c.green : c.muted }]}>{item.note}</Text>
            </View>
          ))}
        </View>

        {isManager ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View><Text style={styles.panelTitle}>روند فروش</Text><Text style={styles.muted}>مقایسه فروش در طول ماه</Text></View>
              <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: c.blue }]} /><Text style={styles.muted}>فروش</Text></View>
            </View>
            <View style={styles.chart}>
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.bars}>
                {salesChart.map((value, index) => <View key={index} style={styles.barSlot}><View style={[styles.bar, { height: `${Math.max(value > 0 ? 5 : 0, (value / maxChart) * 100)}%`, backgroundColor: index === salesChart.length - 1 ? c.purple : c.blue, opacity: index === salesChart.length - 1 ? 1 : 0.72 }]} /></View>)}
              </View>
            </View>
            <View style={styles.chartLabels}>{['۱', '۵', '۱۰', '۱۵', '۲۰', '۲۵', '۳۰'].map((v) => <Text key={v} style={styles.chartLabel}>{v}</Text>)}</View>
            <View style={styles.chartFooter}><Text style={styles.muted}>فروش این ماه</Text><Text style={styles.chartTotal}>{totalSales.toLocaleString('fa-IR')} تومان</Text></View>
          </View>
        ) : (
          <View style={styles.personalBanner}>
            <View style={styles.personalIcon}><Text style={{ color: '#fff', fontSize: 22 }}>✦</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.panelTitle}>عملکرد شخصی شما</Text><Text style={styles.muted}>وضعیت سفارش‌ها و کارهای اختصاص‌یافته به شما</Text></View>
          </View>
        )}

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View><Text style={styles.panelTitle}>فعالیت‌های اخیر</Text><Text style={styles.muted}>آخرین رویدادهای ثبت‌شده</Text></View>
            <Pressable><Text style={styles.link}>مشاهده همه ←</Text></Pressable>
          </View>
          {activities.length === 0 ? <Text style={styles.muted}>هنوز فروشی برای نمایش ثبت نشده است.</Text> : activities.map((item, index) => (
            <View key={item.title} style={[styles.activity, index !== activities.length - 1 && styles.activityBorder]}>
              <View style={[styles.activityIcon, { backgroundColor: item.color }]}><Text style={styles.activityIconText}>{item.icon}</Text></View>
              <View style={styles.activityInfo}><Text style={styles.activityTitle}>{item.title}</Text><Text style={styles.activityDetail}>{item.detail}</Text></View>
              <Text style={[styles.activityAmount, { color: item.amount.startsWith('+') ? c.green : c.muted }]}>{item.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomGrid}>
          <View style={[styles.panel, styles.bottomPanel]}>
            <View style={styles.panelHeader}><View><Text style={styles.panelTitle}>هدف ماهانه</Text><Text style={styles.muted}>پیشرفت تا هدف تعیین‌شده</Text></View></View>
            <View style={styles.goalRow}>
              <View style={styles.goalRing}><View style={styles.goalInner}><Text style={styles.goalPercent}>—</Text><Text style={styles.goalCaption}>تکمیل‌شده</Text></View></View>
              <View style={{ flex: 1 }}><Text style={styles.goalTitle}>هنوز هدفی تعیین نشده است</Text><Text style={styles.muted}>با ثبت هدف ماهانه، پیشرفت شما در این بخش نمایش داده می‌شود.</Text></View>
            </View>
          </View>
          <View style={[styles.panel, styles.bottomPanel]}>
            <View style={styles.panelHeader}><View><Text style={styles.panelTitle}>دسترسی سریع</Text><Text style={styles.muted}>ابزارهای پرکاربرد</Text></View></View>
            <View style={styles.quickActions}>
              {[['＋', 'ثبت سفارش', '#4169F5'], ['♙', 'افزودن مشتری', '#8B63EF'], ['▤', 'گزارش‌ها', '#19B88A']].map(([icon, label, color]) => <Pressable key={label} style={styles.quickAction}><View style={[styles.quickIcon, { backgroundColor: color }]}><Text style={styles.quickIconText}>{icon}</Text></View><Text style={styles.quickLabel}>{label}</Text></Pressable>)}
            </View>
          </View>
        </View>
        <Text style={styles.footer}>Bizly · مدیریت ساده‌تر، رشد هوشمندتر</Text>
      </ScrollView>
    </View>
  );
}

function createStyles(c: typeof palette.light, isNarrow: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40, gap: 18, maxWidth: 1000, width: '100%', alignSelf: 'center' },
    topbar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
    brandRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
    logo: { width: 48, height: 48, borderRadius: 17, backgroundColor: c.blue, alignItems: 'center', justifyContent: 'center', shadowColor: c.blue, shadowOpacity: 0.28, shadowRadius: 12, elevation: 7 },
    logoText: { color: '#fff', fontSize: 29, fontWeight: '900', fontStyle: 'italic' },
    brand: { color: c.text, fontSize: 23, fontWeight: '900', textAlign: 'left' },
    brandSub: { color: c.muted, fontSize: 10, textAlign: 'left', marginTop: 1 },
    themeButton: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, borderColor: c.line, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', elevation: 3 },
    themeIcon: { fontSize: 21, color: c.text },
    greeting: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 7 },
    eyebrow: { color: c.blue, fontSize: 11, fontWeight: '700', textAlign: 'right', marginBottom: 5 },
    heading: { color: c.text, fontSize: isNarrow ? 20 : 24, fontWeight: '900', textAlign: 'right' },
    subheading: { color: c.muted, fontSize: 12, textAlign: 'right', marginTop: 7 },
    avatar: { width: 53, height: 53, borderRadius: 19, backgroundColor: c.purple, alignItems: 'center', justifyContent: 'center', shadowColor: c.purple, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
    avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
    toolbar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    sectionTitle: { color: c.text, fontSize: 16, fontWeight: '800', textAlign: 'right' },
    muted: { color: c.muted, fontSize: 10, lineHeight: 18, textAlign: 'right', marginTop: 3 },
    period: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 12 },
    periodText: { color: c.muted, fontSize: 11 },
    statsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 11 },
    statCard: { width: '48%', flexGrow: 1, flexBasis: isNarrow ? '46%' : '22%', minWidth: isNarrow ? 140 : 145, padding: 15, borderRadius: 20, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, shadowColor: '#23396C', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
    statTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
    statLabel: { color: c.muted, fontSize: 11, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
    statIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    statIconText: { color: '#fff', fontSize: 21, fontWeight: '800' },
    statValue: { color: c.text, fontSize: isNarrow ? 19 : 24, fontWeight: '900', textAlign: 'right', marginTop: 16 },
    statUnit: { color: c.muted, fontSize: 9, textAlign: 'right', marginTop: 2 },
    statNote: { fontSize: 9, textAlign: 'right', marginTop: 11, fontWeight: '600' },
    panel: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 21, padding: 17, shadowColor: '#23396C', shadowOpacity: 0.05, shadowRadius: 13, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
    panelHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 17 },
    panelTitle: { color: c.text, fontSize: 14, fontWeight: '800', textAlign: 'right' },
    legend: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    chart: { height: 175, justifyContent: 'space-between', position: 'relative', paddingTop: 4, paddingBottom: 4 },
    chartGridLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderColor: c.line, borderStyle: 'dashed' },
    bars: { height: '100%', flexDirection: 'row-reverse', alignItems: 'flex-end', justifyContent: 'space-around', gap: 5 },
    barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    bar: { width: '70%', maxWidth: 23, borderTopLeftRadius: 7, borderTopRightRadius: 7, minHeight: 8 },
    chartLabels: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 9 },
    chartLabel: { color: c.muted, fontSize: 9 },
    chartFooter: { borderTopWidth: 1, borderColor: c.line, marginTop: 15, paddingTop: 13, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
    chartTotal: { color: c.text, fontSize: 13, fontWeight: '900' },
    personalBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 13, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 20, padding: 17 },
    personalIcon: { width: 47, height: 47, borderRadius: 16, backgroundColor: c.purple, alignItems: 'center', justifyContent: 'center' },
    link: { color: c.blue, fontSize: 10, fontWeight: '700' },
    activity: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 12 },
    activityBorder: { borderBottomWidth: 1, borderColor: c.line },
    activityIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    activityIconText: { color: '#fff', fontSize: 20, fontWeight: '800' },
    activityInfo: { flex: 1, minWidth: 0 },
    activityTitle: { color: c.text, fontSize: 11, fontWeight: '700', textAlign: 'right' },
    activityDetail: { color: c.muted, fontSize: 9, textAlign: 'right', marginTop: 5, lineHeight: 16 },
    activityAmount: { fontSize: 10, fontWeight: '800', textAlign: 'right', maxWidth: '27%' },
    bottomGrid: { gap: 15 },
    bottomPanel: { flex: 1 },
    goalRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 15 },
    goalRing: { width: 112, height: 112, borderRadius: 56, borderWidth: 10, borderColor: c.blue, alignItems: 'center', justifyContent: 'center', backgroundColor: c.panel },
    goalInner: { alignItems: 'center', justifyContent: 'center' },
    goalPercent: { color: c.text, fontSize: 24, fontWeight: '900' },
    goalCaption: { color: c.muted, fontSize: 9, marginTop: 3 },
    goalTitle: { color: c.text, fontSize: 12, fontWeight: '800', textAlign: 'right', marginBottom: 6 },
    quickActions: { flexDirection: 'row-reverse', justifyContent: 'space-around', gap: 8 },
    quickAction: { alignItems: 'center', gap: 8, flex: 1 },
    quickIcon: { width: 49, height: 49, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    quickIconText: { color: '#fff', fontSize: 23, fontWeight: '800' },
    quickLabel: { color: c.muted, fontSize: 10, textAlign: 'center' },
    footer: { color: c.muted, fontSize: 10, textAlign: 'center', paddingTop: 4 },
  });
}
