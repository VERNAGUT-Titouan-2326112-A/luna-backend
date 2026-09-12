import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';

type PrimaryButtonProps = PressableProps & {
  label: string;
};

export function PrimaryButton({ label, disabled, ...rest }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Palette.rose,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: Palette.roseDark,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: Palette.card,
    fontSize: 16,
    fontWeight: '700',
  },
});
