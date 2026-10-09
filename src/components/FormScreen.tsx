import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormHeader } from '@/components/FormHeader';
import { colors, spacing } from '@/theme';

interface FormScreenProps {
  title: string;
  leftLabel?: string;
  onLeft?: () => void;
  rightLabel?: string;
  onRight?: () => void;
  rightDisabled?: boolean;
  children: React.ReactNode;
  showHeader?: boolean;
}

export function FormScreen({
  title,
  leftLabel = 'Cancel',
  onLeft = () => {},
  rightLabel,
  onRight,
  rightDisabled,
  children,
  showHeader = true,
}: FormScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {showHeader && (
        <FormHeader
          title={title}
          leftLabel={leftLabel}
          onLeft={onLeft}
          rightLabel={rightLabel}
          onRight={onRight}
          rightDisabled={rightDisabled}
        />
      )}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 48 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
});