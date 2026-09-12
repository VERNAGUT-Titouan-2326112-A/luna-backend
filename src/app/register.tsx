import AsyncStorage from '@react-native-async-storage/async-storage';
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

    // Vérification des mots de passe
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Vérification de la date de naissance
    const formattedBirthDate = convertDateToPostgres(birthDate);

    if (!formattedBirthDate) {
      setStep(1);
      setError(
        'La date de naissance doit être au format JJ/MM/AAAA.'
      );
      return;
    }

    // Vérification de la date des dernières règles
    const formattedLastPeriodStart =
      convertDateToPostgres(lastPeriodStart);

    if (!formattedLastPeriodStart) {
      setStep(2);
      setError(
        'La date des dernières règles doit être au format JJ/MM/AAAA.'
      );
      return;
    }

    // Vérification de la durée du cycle
    const cycleLengthNumber = Number(cycleLength);

    if (
      Number.isNaN(cycleLengthNumber) ||
      cycleLengthNumber < 15 ||
      cycleLengthNumber > 60
    ) {
      setStep(2);
      setError(
        'La durée du cycle doit être comprise entre 15 et 60 jours.'
      );
      return;
    }

    // Vérification de la durée des règles
    const periodLengthNumber = Number(periodLength);

    if (
      Number.isNaN(periodLengthNumber) ||
      periodLengthNumber < 1 ||
      periodLengthNumber > 15
    ) {
      setStep(2);
      setError(
        'La durée des règles doit être comprise entre 1 et 15 jours.'
      );
      return;
    }

    // Conversion du poids
    const weightNumber = weight
      ? Number(weight.replace(',', '.'))
      : null;

    if (
      weight &&
      (Number.isNaN(weightNumber))
    ) {
      setStep(1);
      setError('Le poids renseigné est invalide.');
      return;
    }

    // Conversion de la taille
    const heightNumber = height
      ? Number(height)
      : null;

    if (
      height &&
      (Number.isNaN(heightNumber))
    ) {
      setStep(1);
      setError('La taille renseignée est invalide.');
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
          weight: weightNumber,
          height: heightNumber,
          lastPeriodStart: formattedLastPeriodStart,
          cycleLength: cycleLengthNumber,
          periodLength: periodLengthNumber,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      // On récupère d'abord la réponse brute
      const text = await response.text();

      console.log('REGISTER STATUS:', response.status);
      console.log('REGISTER RESPONSE:', text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }

      // Erreur du serveur
      if (!response.ok) {
        setError(
          data.error ||
            'Erreur lors de la création du compte.'
        );
        return;
      }

      // Vérification de la réponse
      if (!data.user) {
        console.error(
          'La réponse du serveur ne contient pas data.user'
        );

        setError(
          'Le compte a été créé mais les informations utilisateur sont introuvables.'
        );

        return;
      }

      console.log('Compte créé :', data.user);

      /*
       * IMPORTANT :
       *
       * On sauvegarde le nouvel utilisateur dans AsyncStorage.
       *
       * HomeScreen utilise "luna-user" pour savoir
       * quel utilisateur est actuellement connecté.
       */
      await AsyncStorage.setItem(
        'luna-user',
        JSON.stringify(data.user)
      );

      console.log(
        'Utilisateur enregistré dans AsyncStorage :',
        data.user.id
      );

      // Redirection vers l'accueil
      router.replace('/Tabs/home');
    } catch (error) {
      console.error(
        'Erreur inscription :',
        error
      );

      setError(
        'Impossible de contacter le serveur.'
      );
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
          <Text style={styles.errorText}>
            {error}
          </Text>
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
            Ces informations permettent à Luna
            d'estimer ton cycle.
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
            Choisis tes identifiants pour pouvoir
            retrouver ton suivi.
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