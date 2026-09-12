import { Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Palette.cream,
          borderTopWidth: 1,
          borderTopColor: '#DDDDDD',
          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarActiveTintColor: Palette.rose,
        tabBarInactiveTintColor: Palette.textSecondary,

        tabBarItemStyle: {
          borderRightWidth: 1,
          borderRightColor: '#DDDDDD',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

<Tabs.Screen
        name="stat"
        options={{
          title: 'Mon cycle',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
    name="sync-outline"
    size={size}
    color={color}
  />
          ),
        }}
      />

       <Tabs.Screen
        name="suivi"
        options={{
          title: 'suivi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
        name="clipboard-outline"
        size={size}
        color={color}
      />
          ),
        }}
      />

<Tabs.Screen
  name="assistant"
  options={{
    title: 'IA',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="sparkles-outline" size={size} color={color} />
    ),
  }}
/>
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}