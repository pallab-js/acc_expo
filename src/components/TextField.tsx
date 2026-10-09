import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, font, radius, spacing } from '@/theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  containerStyle?: React.ComponentProps<typeof View>['style'];
}

export function TextField({ label, style, containerStyle, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...rest}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        placeholderTextColor={colors.faint}
        style={[styles.input, focused && styles.inputFocused, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...font.captionStrong,
    color: colors.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 11,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    paddingVertical: spacing.sm,
    ...font.body,
    color: colors.ink,
  },
  inputFocused: {
    borderColor: colors.ink,
  },
});
