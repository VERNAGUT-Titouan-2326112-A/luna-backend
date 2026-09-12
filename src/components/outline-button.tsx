import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';

type OutlineButtonProps = PressableProps & {
  label: string;
};

export function OutlineButton({ label, ...rest }: OutlineButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      {...rest}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Palette.card,
    borderWidth: 1.5,
    borderColor: Palette.rose,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: Palette.blush,
  },
  label: {
    color: Palette.rose,
    fontSize: 16,
    fontWeight: '700',
  },
});
