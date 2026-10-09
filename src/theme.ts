import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  bg: '#F6F7F9',
  card: '#FFFFFF',
  ink: '#0F172A',
  inkSecondary: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  border: '#E8ECF1',
  hairline: '#EEF1F5',
  primary: '#0F172A',
  primarySoft: '#1E293B',
  income: '#10B981',
  incomeSoft: '#ECFDF5',
  expense: '#F43F5E',
  expenseSoft: '#FFF1F3',
  warn: '#F59E0B',
  warnSoft: '#FFFBEB',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.45)',
  skeleton: '#E8ECF1',
} as const;

export const chartColors = [
  '#0F172A',
  '#3B82F6',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#84CC16',
  '#64748B',
] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const font = {
  hero: { fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  section: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 16, fontWeight: '400' },
  captionStrong: { fontSize: 13, lineHeight: 16, fontWeight: '600' },
  tiny: { fontSize: 11, lineHeight: 14, fontWeight: '500' },
} as const;

export const tabular: TextStyle = Platform.select({
  ios: { fontVariant: ['tabular-nums'] },
  default: {},
}) as TextStyle;

export const shadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {},
}) as ViewStyle;
