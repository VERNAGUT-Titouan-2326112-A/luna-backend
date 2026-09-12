import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OutlineButton } from '@/components/outline-button';
import { PrimaryButton } from '@/components/primary-button';
import { Palette, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <Text style={styles.markLetter}></Text>
        </View>

        <Text style={styles.brand}>Luna</Text>

        <Text style={styles.tagline}>
          Suivez votre cycle en toute sérénité.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Se connecter"
          onPress={() => router.push('/login')}
        />

        <OutlineButton
          label="S'inscrire"
          onPress={() => router.push('/register')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.cream,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    justifyContent: 'space-between',
  },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },

  mark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },

  markLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: Palette.rose,
  },

  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: Palette.text,
  },

  tagline: {
    fontSize: 17,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },

  actions: {
    gap: Spacing.three,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});