import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * --------------------------------------------------
   * CHARGEMENT DU PROFIL
   * --------------------------------------------------
   */

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function loadUser() {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem('luna-user');

      if (!storedUser) {
        Alert.alert('Erreur', 'Utilisateur non connecté.');
        return;
      }

      const loggedUser = JSON.parse(storedUser);

      const response = await fetch(`${API_URL}/user/${loggedUser.id}`);

      if (!response.ok) {
        throw new Error('Impossible de récupérer le profil.');
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.log('Erreur récupération profil:', error);
      Alert.alert('Erreur', 'Impossible de récupérer vos informations.');
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * DÉCONNEXION
   * --------------------------------------------------
   */

  async function logout() {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('luna-user');
              router.replace('/login');
            } catch (error) {
              console.log('Erreur déconnexion:', error);
            }
          },
        },
      ]
    );
  }

  /*
   * --------------------------------------------------
   * FORMAT DATE
   * --------------------------------------------------
   */

  function formatBirthDate(birthDate: string) {
    if (!birthDate) {
      return 'Non renseignée';
    }

    const datePart = birthDate.substring(0, 10);
    const [year, month, day] = datePart.split('-');

    if (!year || !month || !day) {
      return 'Non renseignée';
    }

    return `${day}/${month}/${year}`;
  }

  /*
   * --------------------------------------------------
   * CHARGEMENT
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.rose} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * --------------------------------------------------
   * PAS D'UTILISATEUR
   * --------------------------------------------------
   */

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            Impossible de récupérer votre profil.
          </Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadUser}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * --------------------------------------------------
   * AFFICHAGE
   * --------------------------------------------------
   */

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const avatarLetter = user.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon profil</Text>
          <Text style={styles.subtitle}>
            Gérez vos informations et vos préférences
          </Text>
        </View>

        {/* Card Profil Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          <TouchableOpacity
  style={styles.editButton}
  onPress={() => router.push('/edit-profile')}
>
  <Text style={styles.editIcon}>✎</Text>
</TouchableOpacity>
        </View>

        {/* Informations personnelles */}
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <View style={styles.menu}>
          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Nom complet</Text>
              <Text style={styles.menuValue}>{fullName}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎂</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Date de naissance</Text>
              <Text style={styles.menuValue}>
                {formatBirthDate(user.birthDate)}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚖️</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Poids</Text>
              <Text style={styles.menuValue}>
                {user.weight !== null ? `${user.weight} kg` : 'Non renseigné'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📏</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Taille</Text>
              <Text style={styles.menuValue}>
                {user.height !== null ? `${user.height} cm` : 'Non renseignée'}
              </Text>
            </View>
          </View>
        </View>

        {/* Mon cycle */}
        <Text style={styles.sectionTitle}>Mon cycle</Text>

        <View style={styles.cycleCard}>
          <View style={styles.cycleItem}>
            <Text style={styles.cycleValue}>{user.cycleLength}</Text>
            <Text style={styles.cycleLabel}>jours</Text>
            <Text style={styles.cycleDescription}>Cycle moyen</Text>
          </View>

          <View style={styles.verticalSeparator} />

          <View style={styles.cycleItem}>
            <Text style={styles.cycleValue}>{user.periodLength}</Text>
            <Text style={styles.cycleLabel}>jours</Text>
            <Text style={styles.cycleDescription}>Règles moyennes</Text>
          </View>
        </View>

        {/* Compte */}
        <Text style={styles.sectionTitle}>Compte</Text>

        <View style={styles.menu}>
          <View style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>✉️</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Adresse e-mail</Text>
              <Text style={styles.menuValue}>{user.email}</Text>
            </View>
          </View>
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutIcon}>⇥</Text>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  contentContainer: {
    paddingBottom: 100,
  },

  /* HEADER */
  header: {
    marginBottom: 24,
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

  /* CARD PROFIL */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.rose,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  email: {
    marginTop: 3,
    fontSize: 14,
    color: Palette.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 21,
    color: Palette.rose,
  },

  /* SECTIONS */
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 10,
  },

  /* MENU ITEMS */
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginBottom: 3,
  },
  menuValue: {
    fontSize: 15,
    color: Palette.text,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 64,
  },

  /* CYCLE CARD */
  cycleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 24,
  },
  cycleItem: {
    flex: 1,
    alignItems: 'center',
  },
  cycleValue: {
    fontSize: 25,
    fontWeight: '700',
    color: Palette.rose,
  },
  cycleLabel: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  cycleDescription: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 5,
  },
  verticalSeparator: {
    width: 1,
    backgroundColor: '#EEEEEE',
  },

  /* DÉCONNEXION */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.rose,
    marginTop: 5,
    marginBottom: 10,
  },
  logoutIcon: {
    fontSize: 21,
    color: Palette.rose,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.rose,
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Palette.textSecondary,
  },

  /* ERREUR */
  emptyText: {
    fontSize: 15,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Palette.rose,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});