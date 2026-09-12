import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

const API_URL = 'http://192.168.1.36:3000';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [periodLength, setPeriodLength] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const storedUser = await AsyncStorage.getItem('luna-user');
      if (!storedUser) {
        Alert.alert('Erreur', 'Utilisateur non connecté.');
        router.back();
        return;
      }

      const loggedUser = JSON.parse(storedUser);
      setUserId(loggedUser.id);

      const response = await fetch(`${API_URL}/user/${loggedUser.id}`);
      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();

      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setBirthDate(
        data.birthDate ? data.birthDate.substring(0, 10) : ''
      );
      setWeight(data.weight ? String(data.weight) : '');
      setHeight(data.height ? String(data.height) : '');
      setCycleLength(data.cycleLength ? String(data.cycleLength) : '28');
      setPeriodLength(data.periodLength ? String(data.periodLength) : '5');
    } catch (error) {
      console.log('Erreur chargement profil:', error);
      Alert.alert('Erreur', 'Impossible de charger vos données.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim() || !birthDate.trim()) {
      Alert.alert('Champs manquants', 'Veuillez remplir les informations obligatoires.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
          cycleLength: Number(cycleLength),
          periodLength: Number(periodLength),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      // Mise à jour locale du stockage AsyncStorage si nécessaire
      const storedUser = await AsyncStorage.getItem('luna-user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        await AsyncStorage.setItem(
          'luna-user',
          JSON.stringify({ ...parsed, ...data.user })
        );
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès !', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.log('Erreur modification profil:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder le profil.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.rose} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Modifier le profil</Text>
          </View>

          <Text style={styles.label}>Prénom *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Ex: Clara"
          />

          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Ex: Dupont"
          />

          <Text style={styles.label}>Date de naissance (AAAA-MM-JJ) *</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Poids (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Ex: 60"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Taille (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="Ex: 165"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Durée du cycle (jours)</Text>
              <TextInput
                style={styles.input}
                value={cycleLength}
                onChangeText={setCycleLength}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Durée règles (jours)</Text>
              <TextInput
                style={styles.input}
                value={periodLength}
                onChangeText={setPeriodLength}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Enregistrer les modifications</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.cream },
  container: { flex: 1, paddingHorizontal: 20 },
  content: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginVertical: 20 },
  backButton: { marginBottom: 10 },
  backText: { fontSize: 16, color: Palette.rose, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '700', color: Palette.text },
  label: { fontSize: 13, fontWeight: '600', color: Palette.text, marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Palette.text,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: {
    backgroundColor: Palette.rose,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});