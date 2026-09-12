import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

const API_URL = 'https://luna-backend-latest-n28j.onrender.com';

type TrackingData = {
  period: boolean;
  flow: string;
  mood: string;
  symptoms: string[];
  discharge: string;
  sex: boolean;
  medication: boolean;
  note: string;
};

export default function SuiviScreen() {
  // Initialise d'emblée à midi (12h00)
  const [date, setDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  });
  const [period, setPeriod] = useState(false);
  const [flow, setFlow] = useState('');
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [discharge, setDischarge] = useState('');
  const [sex, setSex] = useState(false);
  const [medication, setMedication] = useState(false);
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInformation();
  }, [date]);



function changeDate(days: number) {
  setDate((currentDate) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      12, // Forcer 12h00
      0,
      0
    );

    newDate.setDate(newDate.getDate() + days);

    return newDate;
  });
}

  function formatDate(date: Date) {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

  function resetInformation() {
    setPeriod(false);
    setFlow('');
    setMood('');
    setSymptoms([]);
    setDischarge('');
    setSex(false);
    setMedication(false);
    setNote('');
  }

  async function loadInformation() {
    try {
      setLoading(true);

      const storedUser =
        await AsyncStorage.getItem('luna-user');

      if (!storedUser) {
        Alert.alert(
          'Erreur',
          'Utilisateur non connecté.'
        );
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await fetch(
        `${API_URL}/tracking/${user.id}`
      );

      if (!response.ok) {
        throw new Error(
          'Impossible de récupérer le suivi.'
        );
      }

      const data = await response.json();

      const key = getDateKey(date);

      const dayData = data[key];

      if (!dayData) {
        resetInformation();
        return;
      }

      setPeriod(dayData.period ?? false);
      setFlow(dayData.flow ?? '');
      setMood(dayData.mood ?? '');
      setSymptoms(dayData.symptoms ?? []);
      setDischarge(dayData.discharge ?? '');
      setSex(dayData.sex ?? false);
      setMedication(dayData.medication ?? false);
      setNote(dayData.note ?? '');

    } catch (error) {
      console.log(
        'Erreur récupération suivi:',
        error
      );

      Alert.alert(
        'Erreur',
        'Impossible de récupérer les informations du jour.'
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleSymptom(symptom: string) {
    if (symptoms.includes(symptom)) {
      setSymptoms(
        symptoms.filter((item) => item !== symptom)
      );
    } else {
      setSymptoms([
        ...symptoms,
        symptom,
      ]);
    }
  }

  async function saveInformation() {
    try {
      setLoading(true);

      const storedUser =
        await AsyncStorage.getItem('luna-user');

      if (!storedUser) {
        Alert.alert(
          'Erreur',
          'Utilisateur non connecté.'
        );
        return;
      }

      const user = JSON.parse(storedUser);

      const dateKey = getDateKey(date);
      console.log('DATE AFFICHÉE :', formatDate(date));

      console.log('DATE ENREGISTRÉE :', dateKey);

      const trackingData: TrackingData = {
        period,
        flow,
        mood,
        symptoms,
        discharge,
        sex,
        medication,
        note,
      };

      const response = await fetch(
        `${API_URL}/tracking/${user.id}/${dateKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingData),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Impossible d’enregistrer les informations.'
        );
      }

      Alert.alert(
        'Enregistré',
        'Les informations ont été ajoutées à votre suivi.'
      );

    } catch (error) {
      console.log(
        'Erreur sauvegarde suivi:',
        error
      );

      Alert.alert(
        'Erreur',
        'Impossible d’enregistrer les informations.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Mon suivi
          </Text>

          <Text style={styles.subtitle}>
            Ajoutez les informations de votre journée.
          </Text>
        </View>

        {/* Date */}
        <View style={styles.dateCard}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => changeDate(-1)}
          >
            <Text style={styles.arrow}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateText}>
            {formatDate(date)}
          </Text>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => changeDate(1)}
          >
            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Règles */}
        <Text style={styles.sectionTitle}>
          🩸 Règles
        </Text>

        <View style={styles.card}>
          <Text style={styles.question}>
            Est-ce que vous avez vos règles ?
          </Text>

          <View style={styles.optionsRow}>
            <OptionButton
              label="Non"
              selected={!period}
              onPress={() => {
                setPeriod(false);
                setFlow('');
              }}
            />

            <OptionButton
              label="Oui"
              selected={period}
              onPress={() => setPeriod(true)}
            />
          </View>

          {period && (
            <>
              <Text style={styles.subQuestion}>
                Intensité du flux
              </Text>

              <View style={styles.optionsRow}>
                <OptionButton
                  label="Léger"
                  selected={flow === 'Léger'}
                  onPress={() =>
                    setFlow('Léger')
                  }
                />

                <OptionButton
                  label="Moyen"
                  selected={flow === 'Moyen'}
                  onPress={() =>
                    setFlow('Moyen')
                  }
                />

                <OptionButton
                  label="Abondant"
                  selected={flow === 'Abondant'}
                  onPress={() =>
                    setFlow('Abondant')
                  }
                />
              </View>
            </>
          )}
        </View>

        {/* Humeur */}
        <Text style={styles.sectionTitle}>
          😊 Humeur
        </Text>

        <View style={styles.card}>
          <View style={styles.moodRow}>
            {[
              {
                emoji: '😊',
                label: 'Bien',
              },
              {
                emoji: '😐',
                label: 'Neutre',
              },
              {
                emoji: '😔',
                label: 'Triste',
              },
              {
                emoji: '😡',
                label: 'Énervée',
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.moodButton,
                  mood === item.label &&
                    styles.selectedMood,
                ]}
                onPress={() =>
                  setMood(item.label)
                }
              >
                <Text style={styles.moodEmoji}>
                  {item.emoji}
                </Text>

                <Text style={styles.moodLabel}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptômes */}
        <Text style={styles.sectionTitle}>
          🤕 Symptômes
        </Text>

        <View style={styles.card}>
          <SymptomButton
            label="Crampes"
            selected={symptoms.includes('Crampes')}
            onPress={() =>
              toggleSymptom('Crampes')
            }
          />

          <SymptomButton
            label="Fatigue"
            selected={symptoms.includes('Fatigue')}
            onPress={() =>
              toggleSymptom('Fatigue')
            }
          />

          <SymptomButton
            label="Maux de tête"
            selected={symptoms.includes('Maux de tête')}
            onPress={() =>
              toggleSymptom('Maux de tête')
            }
          />

          <SymptomButton
            label="Ballonnements"
            selected={symptoms.includes(
              'Ballonnements'
            )}
            onPress={() =>
              toggleSymptom('Ballonnements')
            }
          />

          <SymptomButton
            label="Seins sensibles"
            selected={symptoms.includes(
              'Seins sensibles'
            )}
            onPress={() =>
              toggleSymptom('Seins sensibles')
            }
          />
        </View>

        {/* Pertes */}
        <Text style={styles.sectionTitle}>
          💧 Pertes vaginales
        </Text>

        <View style={styles.card}>
          <View style={styles.optionsRow}>
            <OptionButton
              label="Normales"
              selected={
                discharge === 'Normales'
              }
              onPress={() =>
                setDischarge('Normales')
              }
            />

            <OptionButton
              label="Légères"
              selected={
                discharge === 'Légères'
              }
              onPress={() =>
                setDischarge('Légères')
              }
            />

            <OptionButton
              label="Abondantes"
              selected={
                discharge === 'Abondantes'
              }
              onPress={() =>
                setDischarge('Abondantes')
              }
            />
          </View>
        </View>

        {/* Vie intime */}
        <Text style={styles.sectionTitle}>
          ❤️ Vie intime
        </Text>

        <View style={styles.card}>
          <Text style={styles.question}>
            Rapport sexuel aujourd'hui ?
          </Text>

          <View style={styles.optionsRow}>
            <OptionButton
              label="Non"
              selected={!sex}
              onPress={() => setSex(false)}
            />

            <OptionButton
              label="Oui"
              selected={sex}
              onPress={() => setSex(true)}
            />
          </View>
        </View>

        {/* Médicament */}
        <Text style={styles.sectionTitle}>
          💊 Médicament / contraception
        </Text>

        <View style={styles.card}>
          <Text style={styles.question}>
            Avez-vous pris un médicament ou une
            contraception ?
          </Text>

          <View style={styles.optionsRow}>
            <OptionButton
              label="Non"
              selected={!medication}
              onPress={() =>
                setMedication(false)
              }
            />

            <OptionButton
              label="Oui"
              selected={medication}
              onPress={() =>
                setMedication(true)
              }
            />
          </View>
        </View>

        {/* Note */}
        <Text style={styles.sectionTitle}>
          📝 Note
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Ajoutez une note..."
            placeholderTextColor={
              Palette.textSecondary
            }
            multiline
          />
        </View>

        {/* Enregistrer */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled,
          ]}
          onPress={saveInformation}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading
              ? 'Enregistrement...'
              : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Bouton Oui / Non */

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected &&
          styles.optionButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected &&
            styles.optionTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* Bouton symptôme */

function SymptomButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.symptomButton,
        selected &&
          styles.symptomSelected,
      ]}
      onPress={onPress}
    >
      <Text style={styles.symptomText}>
        {label}
      </Text>

      <View
        style={[
          styles.checkbox,
          selected &&
            styles.checkboxSelected,
        ]}
      >
        {selected && (
          <Text style={styles.check}>
            ✓
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.cream,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Palette.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: Palette.textSecondary,
  },

  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    marginBottom: 28,
  },

  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    fontSize: 28,
    color: Palette.rose,
  },

  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    textTransform: 'capitalize',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },

  question: {
    fontSize: 14,
    color: Palette.text,
    marginBottom: 14,
  },

  subQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
    marginTop: 18,
    marginBottom: 12,
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
  },

  optionButtonSelected: {
    backgroundColor: Palette.blush,
    borderColor: Palette.rose,
  },

  optionText: {
    fontSize: 14,
    color: Palette.textSecondary,
  },

  optionTextSelected: {
    color: Palette.rose,
    fontWeight: '600',
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  moodButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
  },

  selectedMood: {
    backgroundColor: Palette.blush,
  },

  moodEmoji: {
    fontSize: 27,
  },

  moodLabel: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 4,
  },

  symptomButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  symptomSelected: {
    backgroundColor: Palette.blush,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  symptomText: {
    fontSize: 14,
    color: Palette.text,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    backgroundColor: Palette.rose,
    borderColor: Palette.rose,
  },

  check: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  input: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Palette.text,
  },

  saveButton: {
    backgroundColor: Palette.rose,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 5,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});