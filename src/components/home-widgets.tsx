import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';

type InfoCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function InfoCard({ label, value, hint }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

type DayChipProps = {
  letter: string;
  day: number;
  isToday?: boolean;
  isPeriod?: boolean;
  isOvulation?: boolean;
};

export function DayChip({ letter, day, isToday, isPeriod, isOvulation }: DayChipProps) {
  return (
    <View style={[styles.chip, isToday && styles.chipToday]}>
      <Text style={[styles.chipLetter, isToday && styles.chipTodayText]}>{letter}</Text>
      <View
        style={[
          styles.chipDay,
          isPeriod && styles.chipPeriod,
          isOvulation && styles.chipOvulation,
        ]}>
        <Text
          style={[
            styles.chipDayText,
            (isPeriod || isOvulation) && styles.chipDayTextOnColor,
          ]}>
          {day}
        </Text>
      </View>
    </View>
  );
}

type TextLinkProps = {
  label: string;
  onPress: () => void;
};

export function TextLink({ label, onPress }: TextLinkProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <Text style={styles.textLink}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: Spacing.three,
    gap: 4,
    borderWidth: 1,
    borderColor: Palette.border,
    minWidth: 140,
  },
  label: {
    fontSize: 13,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  hint: {
    fontSize: 13,
    color: Palette.mauve,
  },
  chip: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  chipToday: {
    transform: [{ scale: 1.05 }],
  },
  chipLetter: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  chipTodayText: {
    color: Palette.rose,
  },
  chipDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.blush,
  },
  chipPeriod: {
    backgroundColor: Palette.rose,
  },
  chipOvulation: {
    backgroundColor: Palette.mauve,
  },
  chipDayText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
  },
  chipDayTextOnColor: {
    color: Palette.card,
  },
  textLink: {
    color: Palette.mauve,
    fontSize: 14,
    fontWeight: '600',
  },
});
