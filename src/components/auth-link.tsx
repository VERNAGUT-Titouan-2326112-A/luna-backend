import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/theme';

type AuthLinkProps = {
  label: string;
  onPress: () => void;
};

export function AuthLink({ label, onPress }: AuthLinkProps) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: Palette.mauve,
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
