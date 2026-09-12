import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayChip, InfoCard, TextLink } from '@/components/home-widgets';
import { Palette, Spacing } from '@/constants/theme';
import {
  addDays,
  formatLongDate,
  formatShortDate,
  getCycleSnapshot,
  weekdayLetter,
} from '@/lib/cycle';

const API_URL = 'https://luna-backend-latest-n28j.onrender.com';

type LoggedUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type UserData = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  weight: string | null;
  height: string | null;
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  email: string;
};

function heroCopy(snapshot: ReturnType<typeof getCycleSnapshot>) {
  if (
    snapshot.isOnPeriod &&
    snapshot.periodDay !== null &&
    snapshot.daysLeftInPeriod !== null
  ) {
    return {
      kicker: `Jour ${snapshot.periodDay} des règles`,
      number: String(snapshot.daysLeftInPeriod),
      unit: snapshot.daysLeftInPeriod > 1 ? 'jours' : 'jour',
      caption:
        snapshot.daysLeftInPeriod === 1
          ? "encore aujourd'hui"
          : 'encore estimés',
    };
  }

  if (snapshot.daysUntilPeriod === 1) {
    return {
      kicker: 'Tes règles',
      number: '1',
      unit: 'jour',
      caption: 'avant tes règles',
    };
  }

  return {
    kicker: 'Prochaines règles',
    number: String(snapshot.daysUntilPeriod),
    unit: 'jours',
    caption: 'avant tes règles',
  };
}

function ovulationCopy(
  daysUntilOvulation: number,
  ovulationDate: Date
): { value: string; hint: string } {
  if (daysUntilOvulation === 0) {
    return {
      value: "Aujourd'hui",
      hint: formatShortDate(ovulationDate),
    };
  }

  if (daysUntilOvulation > 0) {
    return {
      value: `Dans ${daysUntilOvulation} j`,
      hint: formatShortDate(ovulationDate),
    };
  }

  return {
    value: `Il y a ${Math.abs(daysUntilOvulation)} j`,
    hint: formatShortDate(ovulationDate),
  };
}

export default function HomeScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Récupération de l'utilisateur connecté
      const storedUser = await AsyncStorage.getItem('luna-user');

      if (!storedUser) {
        router.replace('/login');
        return;
      }

      const loggedUser: LoggedUser = JSON.parse(storedUser);

      // Récupération des données complètes depuis PostgreSQL
      const response = await fetch(
        `${API_URL}/user/${loggedUser.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Impossible de récupérer tes informations.'
        );
        return;
      }

      setUser(data);
    } catch (error) {
      console.error(
        'Erreur récupération utilisateur :',
        error
      );

      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            Chargement de ton cycle...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>
            {error || 'Impossible de charger tes données.'}
          </Text>

          <TextLink
            label="Réessayer"
            onPress={loadUser}
          />
        </View>
      </SafeAreaView>
    );
  }

  const today = new Date();

  /*
   * Les données du cycle viennent de PostgreSQL.
   *
   * lastPeriodStart = premier jour des dernières règles
   * cycleLength     = durée du cycle
   * periodLength    = durée des règles
   */
  const lastPeriodStart = new Date(user.lastPeriodStart);

  // Vérification de la date reçue depuis PostgreSQL
  if (Number.isNaN(lastPeriodStart.getTime())) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>
            La date de tes dernières règles est invalide.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const snapshot = getCycleSnapshot(
    lastPeriodStart,
    user.cycleLength,
    user.periodLength
  );

  const hero = heroCopy(snapshot);

  const ovulation = ovulationCopy(
    snapshot.daysUntilOvulation,
    snapshot.ovulationDate
  );

  const progress =
    snapshot.cycleDay / snapshot.cycleLength;

  /*
   * Affichage des 7 jours autour d'aujourd'hui
   */
  const week = Array.from(
    { length: 7 },
    (_, index) => addDays(today, index - 3)
  );

  const ovulationCycleDay = Math.max(
    1,
    snapshot.cycleLength - 14
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.topBar}>
          <View>
            <Text style={styles.hello}>
              Bonjour {user.firstName}
            </Text>

            <Text style={styles.date}>
              {formatLongDate(today)}
            </Text>
          </View>

        </View>

        {/* CARTE PRINCIPALE */}

        <View style={styles.hero}>
          <Text style={styles.heroKicker}>
            {hero.kicker}
          </Text>

          <View style={styles.heroNumberRow}>
            <Text style={styles.heroNumber}>
              {hero.number}
            </Text>

            <Text style={styles.heroUnit}>
              {hero.unit}
            </Text>
          </View>

          <Text style={styles.heroCaption}>
            {hero.caption}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 1) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressLabel}>
            Jour {snapshot.cycleDay} sur {snapshot.cycleLength}
          </Text>
        </View>

        {/* SEMAINE */}

        <View style={styles.week}>
          {week.map((date) => {
            const isToday =
              date.toDateString() === today.toDateString();

            const dayNum = date.getDate();

            /*
             * Nombre de jours entre aujourd'hui
             * et le jour affiché.
             */
            const offset = Math.round(
              (date.getTime() - today.getTime()) /
                86_400_000
            );

            /*
             * Calcul du jour du cycle correspondant
             * au jour affiché.
             */
            const cycleDay =
              ((snapshot.cycleDay -
                1 +
                offset) %
                snapshot.cycleLength +
                snapshot.cycleLength) %
                snapshot.cycleLength +
              1;

            return (
              <DayChip
                key={date.toISOString()}
                letter={weekdayLetter(date)}
                day={dayNum}
                isToday={isToday}
                isPeriod={
                  cycleDay <= snapshot.periodLength
                }
                isOvulation={
                  cycleDay === ovulationCycleDay
                }
              />
            );
          })}
        </View>

        {/* INFORMATIONS */}

        <View style={styles.grid}>
          <InfoCard
            label="Phase actuelle"
            value={snapshot.phaseLabel}
            hint="Selon ton cycle"
          />

          <InfoCard
            label="Ovulation"
            value={ovulation.value}
            hint={ovulation.hint}
          />

          <InfoCard
            label="Prochaines règles"
            value={formatShortDate(
              snapshot.nextPeriodDate
            )}
            hint={`Cycle de ${snapshot.cycleLength} jours`}
          />

          <InfoCard
            label="Fertilité"
            value={snapshot.fertilityLabel}
            hint="Estimation"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.cream,
  },

  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.two,
  },

  hello: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
  },

  date: {
    marginTop: 4,
    fontSize: 15,
    color: Palette.textSecondary,
  },

  hero: {
    backgroundColor: Palette.card,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: Spacing.two,
  },

  heroKicker: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.mauve,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  heroNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },

  heroNumber: {
    fontSize: 64,
    lineHeight: 70,
    fontWeight: '700',
    color: Palette.rose,
  },

  heroUnit: {
    fontSize: 22,
    fontWeight: '600',
    color: Palette.text,
    paddingBottom: 10,
  },

  heroCaption: {
    fontSize: 18,
    color: Palette.text,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.blush,
    overflow: 'hidden',
    marginTop: Spacing.two,
  },

  progressFill: {
    height: '100%',
    backgroundColor: Palette.rose,
    borderRadius: 4,
  },

  progressLabel: {
    fontSize: 13,
    color: Palette.textSecondary,
  },

  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.card,
    borderRadius: 20,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: Palette.border,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },

  loadingText: {
    fontSize: 16,
    color: Palette.textSecondary,
  },

  error: {
    fontSize: 16,
    color: Palette.rose,
    textAlign: 'center',
  },
});
