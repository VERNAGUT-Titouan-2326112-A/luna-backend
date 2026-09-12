import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthLink } from '@/components/auth-link';
import { AuthScreen } from '@/components/auth-screen';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { Palette, Spacing } from '@/constants/theme';

const API_URL = 'http://192.168.1.36:3000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'E-mail ou mot de passe incorrect.');
        return;
      }

      console.log('Utilisateur connecté :', data.user);

      // Sauvegarde de l'utilisateur connecté
      await AsyncStorage.setItem(
        'luna-user',
        JSON.stringify(data.user)
      );

      router.replace('/Tabs/home');

    } catch (error) {
      console.error('Erreur connexion :', error);

      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Se connecter"
      subtitle="Retrouvez le suivi de votre cycle."
    >
      <View style={styles.form}>
        <TextField
          label="E-mail"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError('');
          }}
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
            setError('');
          }}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          placeholder="••••••••"
        />

        {error !== '' && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}
      </View>

      <PrimaryButton
        label={loading ? 'Connexion...' : 'Se connecter'}
        onPress={handleLogin}
      />

      <AuthLink
        label="Pas encore de compte ? S'inscrire"
        onPress={() => router.replace('/register')}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },

  error: {
    color: Palette.rose,
    textAlign: 'center',
    fontSize: 14,
  },
});
