import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';

const API_URL = 'https://luna-backend-latest-n28j.onrender.com';
type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  weight: number | null;
  height: number | null;
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
};

type DayInfo = {
  period: boolean;
  flow: string | null;
  mood: string | null;
  symptoms: string[] | null;
  discharge: string | null;
  sex: boolean;
  medication: boolean;
  note: string | null;
};

export default function StatScreen() {
  const today = new Date();

  const [user, setUser] = useState<User | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarData, setCalendarData] = useState<Record<string, DayInfo>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadCalendarData();
    }, [])
  );

  async function loadUser() {
    try {
      const storedUser = await AsyncStorage.getItem('luna-user');
      if (!storedUser) return;

      const loggedUser = JSON.parse(storedUser);
      const response = await fetch(`${API_URL}/user/${loggedUser.id}`);

      if (!response.ok) throw new Error('Impossible de récupérer l’utilisateur.');

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.log('Erreur récupération utilisateur:', error);
    }
  }

  async function loadCalendarData() {
    try {
      const storedUser = await AsyncStorage.getItem('luna-user');
      if (!storedUser) {
        Alert.alert('Erreur', 'Utilisateur non connecté.');
        return;
      }

      const loggedUser = JSON.parse(storedUser);
      const response = await fetch(`${API_URL}/tracking/${loggedUser.id}`);

      if (!response.ok) throw new Error('Impossible de récupérer les suivis.');

      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.log('Erreur récupération suivi:', error);
    }
  }

  function getDateKey(year: number, month: number, day: number) {
    const monthString = String(month + 1).padStart(2, '0');
    const dayString = String(day).padStart(2, '0');
    return `${year}-${monthString}-${dayString}`;
  }

  function parseDate(dateString: string): Date {
    const [year, month, day] = dateString.substring(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  function getDifferenceInDays(date1: Date, date2: Date) {
    const first = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), 12);
    const second = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(), 12);
    return Math.round((first.getTime() - second.getTime()) / 86_400_000);
  }

  function isPredictedPeriod(date: Date): boolean {
    if (!user || !user.lastPeriodStart || !user.cycleLength || !user.periodLength) return false;
    const lastPeriodStart = parseDate(user.lastPeriodStart);
    const difference = getDifferenceInDays(date, lastPeriodStart);
    if (difference < 0) return false;
    const cycleDay = difference % user.cycleLength;
    return cycleDay < user.periodLength;
  }

  function isPredictedOvulation(date: Date): boolean {
    if (!user || !user.lastPeriodStart || !user.cycleLength) return false;
    const lastPeriodStart = parseDate(user.lastPeriodStart);
    const difference = getDifferenceInDays(date, lastPeriodStart);
    if (difference < 0) return false;
    const cycleDay = (difference % user.cycleLength) + 1;
    const ovulationDay = Math.max(1, user.cycleLength - 14);
    return cycleDay === ovulationDay;
  }

  function changeMonth(direction: number) {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  }

  function getMonthName() {
    const date = new Date(currentYear, currentMonth, 1, 12);
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  }

  /*
   * --------------------------------------------------
   * CONSTRUCTION DU CALENDRIER
   * --------------------------------------------------
   */

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1, 12);
  // getDay() : 0=Dim, 1=Lun, 2=Mar... On ajuste pour que 0=Lun, 6=Dim
  const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // On crée un tableau qui contient des cases vides (null) + les numéros de jours
  const calendarSlots: (number | null)[] = [];
  
  for (let i = 0; i < dayOfWeek; i++) {
    calendarSlots.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarSlots.push(day);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* MOIS */}
      <View style={styles.monthHeader}>
        <TouchableOpacity style={styles.arrowButton} onPress={() => changeMonth(-1)}>
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthTitle}>{getMonthName()}</Text>

        <TouchableOpacity style={styles.arrowButton} onPress={() => changeMonth(1)}>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* JOURS DE LA SEMAINE */}
      <View style={styles.weekHeader}>
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      {/* CALENDRIER */}
      <View style={styles.calendar}>
        {calendarSlots.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayContainer} />;
          }

          const key = getDateKey(currentYear, currentMonth, day);
          const date = new Date(currentYear, currentMonth, day, 12, 0, 0);

          const info = calendarData[key];
          const predictedPeriod = isPredictedPeriod(date);
          const predictedOvulation = isPredictedOvulation(date);

          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          const isSelected = selectedDate === key;

          return (
            <TouchableOpacity
              key={key}
              style={styles.dayContainer}
              onPress={() => {
                console.log('JOUR CLIQUÉ :', day, 'CLÉ :', key);
                setSelectedDate(key);
              }}
            >
              <View
                style={[
                  styles.day,
                  predictedPeriod && styles.predictedPeriodDay,
                  info?.period && styles.periodDay,
                  predictedOvulation && !predictedPeriod && styles.ovulationDay,
                  isToday && styles.today,
                  isSelected && styles.selectedDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    predictedPeriod && styles.predictedPeriodText,
                    info?.period && styles.periodDayText,
                    predictedOvulation && !predictedPeriod && styles.ovulationText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {day}
                </Text>

                {/* INDICATEURS */}
                {(info || predictedOvulation) && (
                  <View style={styles.indicators}>
                    {info?.period && <View style={styles.periodDot} />}
                    {!info?.period && predictedPeriod && (
                      <View style={styles.predictedPeriodDot} />
                    )}
                    {predictedOvulation && <View style={styles.ovulationDot} />}
                    {info?.sex && <View style={styles.sexDot} />}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LÉGENDE */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.periodDot} />
          <Text style={styles.legendText}>Règles enregistrées</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.predictedPeriodDot} />
          <Text style={styles.legendText}>Règles potentielles</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.ovulationDot} />
          <Text style={styles.legendText}>Ovulation potentielle</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.sexDot} />
          <Text style={styles.legendText}>Rapport enregistré</Text>
        </View>
      </View>

      {/* INFORMATIONS DU JOUR */}
      {selectedDate && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedTitle}>
            {parseDate(selectedDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>

          {calendarData[selectedDate] ? (
            <View>
              {calendarData[selectedDate].period && (
                <Text style={styles.infoText}>🩷 Règles enregistrées</Text>
              )}
              {calendarData[selectedDate].flow && (
                <Text style={styles.infoText}>
                  Flux : {calendarData[selectedDate].flow}
                </Text>
              )}
              {calendarData[selectedDate].mood && (
                <Text style={styles.infoText}>
                  Humeur : {calendarData[selectedDate].mood}
                </Text>
              )}
              {calendarData[selectedDate].symptoms &&
                calendarData[selectedDate].symptoms!.length > 0 && (
                  <Text style={styles.infoText}>
                    Symptômes : {calendarData[selectedDate].symptoms!.join(', ')}
                  </Text>
                )}
              {calendarData[selectedDate].sex && (
                <Text style={styles.infoText}>Rapport enregistré</Text>
              )}
              {calendarData[selectedDate].medication && (
                <Text style={styles.infoText}>Médicament enregistré</Text>
              )}
              {calendarData[selectedDate].note && (
                <Text style={styles.infoText}>
                  Note : {calendarData[selectedDate].note}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Aucun suivi enregistré pour cette journée.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 120,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    textTransform: 'capitalize',
  },
  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  arrow: {
    fontSize: 30,
    color: Palette.rose,
    lineHeight: 32,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  dayContainer: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  day: {
    width: 42,
    height: 48,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.text,
  },
  predictedPeriodDay: {
    backgroundColor: '#FCEBED',
  },
  predictedPeriodText: {
    color: '#D98595',
    fontWeight: '600',
  },
  predictedPeriodDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D98595',
  },
  periodDay: {
    backgroundColor: '#FADADD',
  },
  periodDayText: {
    color: '#D85C70',
    fontWeight: '800',
  },
  periodDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D85C70',
  },
  ovulationDay: {
    backgroundColor: '#EADCF4',
  },
  ovulationText: {
    color: '#9A70B5',
    fontWeight: '700',
  },
  ovulationDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#9A70B5',
  },
  today: {
    borderWidth: 2,
    borderColor: Palette.rose,
  },
  todayText: {
    fontWeight: '800',
  },
  selectedDay: {
    backgroundColor: Palette.mauve,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  indicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 3,
  },
  sexDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.textSecondary,
  },
  legend: {
    marginTop: 20,
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendText: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  selectedCard: {
    marginTop: 20,
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  selectedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  infoText: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
});