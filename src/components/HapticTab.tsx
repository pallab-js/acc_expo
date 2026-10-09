import * as Haptics from 'expo-haptics';
import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import React from 'react';
import { Pressable } from 'react-native';

type PressableProps = React.ComponentProps<typeof Pressable>;

/** Tab button with a light haptic tick on press (iOS). */
export function HapticTab(props: BottomTabBarButtonProps) {
  const { href, hoverEffect, pressColor, pressOpacity, ...rest } = props;
  void href;
  void hoverEffect;
  void pressColor;
  void pressOpacity;

  return (
    <Pressable
      {...(rest as PressableProps)}
      onPressIn={(event) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        props.onPressIn?.(event);
      }}
    />
  );
}
