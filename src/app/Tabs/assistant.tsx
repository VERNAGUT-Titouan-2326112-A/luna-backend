import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

type Message = {
  id: string;
  text: string;
  fromUser: boolean;
};

const API_URL = 'https://luna-backend-latest-n28j.onrender.com';

export default function AssistantScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour 👋 Je suis Luna, ton assistant. Tu peux me poser des questions sur ton cycle, tes règles, tes symptômes ou ton suivi.',
      fromUser: false,
    },
  ]);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      fromUser: true,
    };

    setMessages((current) => [...current, newMessage]);
    setMessage('');
    Keyboard.dismiss();
    setLoading(true);

    // Faire descendre la liste
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur serveur');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        fromUser: false,
      };

      setMessages((current) => [...current, aiMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Erreur:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolée, je n'arrive pas à répondre pour le moment. Vérifie que le serveur Luna est bien lancé.",
        fromUser: false,
      };

      setMessages((current) => [...current, errorMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } finally {
      setLoading(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    return (
      <View
        style={[
          styles.messageContainer,
          item.fromUser
            ? styles.userMessageContainer
            : styles.aiMessageContainer,
        ]}
      >
        {!item.fromUser && (
          <View style={styles.aiAvatar}>
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={Palette.rose}
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            item.fromUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.fromUser && styles.userMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color={Palette.rose}
            />
          </View>

          <View>
            <Text style={styles.title}>Assistant Luna</Text>
            <Text style={styles.subtitle}>
              Pose tes questions sur ton cycle
            </Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />

        {/* Luna réfléchit */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.aiAvatar}>
              <Ionicons
                name="sparkles-outline"
                size={18}
                color={Palette.rose}
              />
            </View>

            <View style={styles.loadingBubble}>
              <ActivityIndicator
                size="small"
                color={Palette.rose}
              />

              <Text style={styles.loadingText}>
                Luna réfléchit...
              </Text>
            </View>
          </View>
        )}

        {/* Suggestions */}
        {!loading && (
          <View style={styles.suggestions}>
            <TouchableOpacity
              style={styles.suggestion}
              onPress={() =>
                setMessage(
                  'Pourquoi ai-je mal au ventre pendant mes règles ?'
                )
              }
            >
              <Text style={styles.suggestionText}>
                Pourquoi ai-je mal au ventre ?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestion}
              onPress={() =>
                setMessage(
                  'Est-ce normal que mon cycle soit irrégulier ?'
                )
              }
            >
              <Text style={styles.suggestionText}>
                Cycle irrégulier ?
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question..."
            placeholderTextColor={Palette.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || loading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || loading}
          >
            <Ionicons
              name="arrow-up"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          L'assistant Luna fournit des informations générales et ne
          remplace pas un professionnel de santé.
        </Text>
      </KeyboardAvoidingView>
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
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: Palette.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Palette.textSecondary,
  },

  messages: {
    padding: 20,
    paddingBottom: 10,
  },

  messageContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },

  aiMessageContainer: {
    justifyContent: 'flex-start',
  },

  userMessageContainer: {
    justifyContent: 'flex-end',
  },

  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
  },

  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
  },

  userBubble: {
    backgroundColor: Palette.rose,
    borderBottomRightRadius: 5,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: Palette.text,
  },

  userMessageText: {
    color: '#FFFFFF',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: Palette.textSecondary,
  },

  suggestions: {
    paddingHorizontal: 15,
    paddingBottom: 8,
  },

  suggestion: {
    backgroundColor: Palette.blush,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },

  suggestionText: {
    fontSize: 13,
    color: Palette.rose,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: Palette.text,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: Palette.textSecondary,
    paddingHorizontal: 30,
    paddingVertical: 8,
  },
});