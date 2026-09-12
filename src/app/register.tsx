import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthLink } from '@/components/auth-link';
import { AuthScreen } from '@/components/auth-screen';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { Palette, Spacing } from '@/constants/theme';

const API_URL = 'https://luna-backend-latest-n28j.onrender.com';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);

  // Informations personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Informations du cycle
  const [lastPeriodStart, setLastPeriodStart] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');

  // Compte
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function nextStep() {
    setError('');

    if (step < 3) {
      setStep(step + 1);
    }
  }

  function previousStep() {
    setError('');

    if (step > 1) {
      setStep(step - 1);
    }
  }

  function convertDateToPostgres(date: string): string | null {
    const parts = date.split('/');

    if (parts.length !== 3) {
      return null;
    }

    const [day, month, year] = parts;

    if (
      day.length !== 2 ||
      month.length !== 2 ||
      year.length !== 4
    ) {
      return null;
    }

    const dayNumber = Number(day);
    const monthNumber = Number(month);
    const yearNumber = Number(year);

    if (
      Number.isNaN(dayNumber) ||
      Number.isNaN(monthNumber) ||
      Number.isNaN(yearNumber)
    ) {
      return null;
    }

    if (
      dayNumber < 1 ||
      dayNumber > 31 ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      yearNumber < 1900
    ) {
      return null;
    }

    return `${year}-${month}-${day}`;
  }

  async function handleRegister() {
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const formattedBirthDate = convertDateToPostgres(birthDate);
    const formattedLastPeriodStart =
      convertDateToPostgres(lastPeriodStart);

    if (!formattedBirthDate) {
      setStep(1);
      setError('La date de naissance doit être au format JJ/MM/AAAA.');
      return;
    }

    if (!formattedLastPeriodStart) {
      setStep(2);
      setError(
        'La date des dernières règles doit être au format JJ/MM/AAAA.'
      );
      return;
    }

    const cycleLengthNumber = Number(cycleLength);
    const periodLengthNumber = Number(periodLength);

    if (
      Number.isNaN(cycleLengthNumber) ||
      cycleLengthNumber < 15 ||
      cycleLengthNumber > 60
    ) {
      setStep(2);
      setError('La durée du cycle doit être comprise entre 15 et 60 jours.');
      return;
    }

    if (
      Number.isNaN(periodLengthNumber) ||
      periodLengthNumber < 1 ||
      periodLengthNumber > 15
    ) {
      setStep(2);
      setError('La durée des règles doit être comprise entre 1 et 15 jours.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate: formattedBirthDate,
          weight,
          height,
          lastPeriodStart: formattedLastPeriodStart,
          cycleLength: cycleLengthNumber,
          periodLength: periodLengthNumber,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Erreur lors de la création du compte.'
        );
        return;
      }

      console.log('Compte créé :', data.user);

      router.replace('/Tabs/home');
    } catch (error) {
      console.error('Erreur inscription :', error);
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Créer un compte"
      subtitle="Quelques informations pour commencer."
    >
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Étape {step} sur 3
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(step / 3) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ÉTAPE 1 */}
      {step === 1 && (
        <View style={styles.form}>
          <Text style={styles.stepTitle}>
            Faisons connaissance 🌸
          </Text>

          <Text style={styles.stepSubtitle}>
            Comment pouvons-nous t'appeler ?
          </Text>

          <TextField
            label="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            textContentType="givenName"
            autoComplete="given-name"
            placeholder="Léa"
          />

          <TextField
            label="Nom"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            textContentType="familyName"
            autoComplete="family-name"
            placeholder="Dupont"
          />

          <TextField
            label="Date de naissance"
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numbers-and-punctuation"
            placeholder="JJ/MM/AAAA"
          />

          <TextField
            label="Poids (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="58,5"
          />

          <TextField
            label="Taille (cm)"
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
            placeholder="165"
          />

          <PrimaryButton
            label="Continuer"
            onPress={nextStep}
          />
        </View>
      )}

      {/* ÉTAPE 2 */}
      {step === 2 && (
        <View style={styles.form}>
          <Text style={styles.stepTitle}>
            Parlons de ton cycle 🌷
          </Text>

          <Text style={styles.stepSubtitle}>
            Ces informations permettent à Luna d'estimer ton cycle.
          </Text>

          <TextField
            label="Premier jour de tes dernières règles"
            value={lastPeriodStart}
            onChangeText={setLastPeriodStart}
            keyboardType="numbers-and-punctuation"
            placeholder="JJ/MM/AAAA"
          />

          <TextField
            label="Durée moyenne de ton cycle (jours)"
            value={cycleLength}
            onChangeText={setCycleLength}
            keyboardType="number-pad"
            placeholder="28"
          />

          <TextField
            label="Durée moyenne de tes règles (jours)"
            value={periodLength}
            onChangeText={setPeriodLength}
            keyboardType="number-pad"
            placeholder="5"
          />

          <View style={styles.buttons}>
            <View style={styles.buttonHalf}>
              <PrimaryButton
                label="← Retour"
                onPress={previousStep}
              />
            </View>

            <View style={styles.buttonHalf}>
              <PrimaryButton
                label="Continuer →"
                onPress={nextStep}
              />
            </View>
          </View>
        </View>
      )}

      {/* ÉTAPE 3 */}
      {step === 3 && (
        <View style={styles.form}>
          <Text style={styles.stepTitle}>
            Sécurise ton compte 🔐
          </Text>

          <Text style={styles.stepSubtitle}>
            Choisis tes identifiants pour pouvoir retrouver ton suivi.
          </Text>

          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="vous@email.com"
          />

          <TextField
            label="Mot de passe"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (error) {
                setError('');
              }
            }}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <TextField
            label="Confirmation du mot de passe"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (error) {
                setError('');
              }
            }}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <View style={styles.buttons}>
            <View style={styles.buttonHalf}>
              <PrimaryButton
                label="← Retour"
                onPress={previousStep}
              />
            </View>

            <View style={styles.buttonHalf}>
              <PrimaryButton
                label={
                  loading
                    ? 'Création...'
                    : 'Créer mon compte'
                }
                onPress={handleRegister}
              />
            </View>
          </View>
        </View>
      )}

      <AuthLink
        label="Déjà un compte ? Se connecter"
        onPress={() => router.replace('/login')}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: Spacing.four,
  },

  progressText: {
    textAlign: 'center',
    color: Palette.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },

  progressBar: {
    height: 6,
    backgroundColor: Palette.blush,
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: Palette.rose,
    borderRadius: 10,
  },

  errorContainer: {
    backgroundColor: '#FCE8E8',
    borderRadius: 12,
    padding: 12,
    marginBottom: Spacing.three,
  },

  errorText: {
    color: '#B42318',
    fontSize: 14,
    textAlign: 'center',
  },

  form: {
    gap: Spacing.three,
  },

  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    textAlign: 'center',
    marginBottom: 2,
  },

  stepSubtitle: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },

  buttons: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },

  buttonHalf: {
    flex: 1,
  },
});