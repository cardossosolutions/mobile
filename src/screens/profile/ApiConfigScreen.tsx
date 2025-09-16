import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateApiHost, API_CONFIG } from '../../config/api';
import { useToast } from '../../contexts/ToastContext';

interface ApiConfigScreenProps {
  navigation: any;
}

const ApiConfigScreen: React.FC<ApiConfigScreenProps> = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('api_base_url');
      if (savedUrl) {
        setApiUrl(savedUrl);
      } else {
        setApiUrl(API_CONFIG.BASE_URL);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      setApiUrl(API_CONFIG.BASE_URL);
    }
  };

  const testConnection = async (url: string) => {
    setTestingConnection(true);
    try {
      const testUrl = url.endsWith('/api') ? url : `${url}/api`;
      const response = await fetch(`${testUrl}/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        // 401 é esperado sem token, significa que a API está respondendo
        showSuccess('Conexão OK!', 'A API está respondendo corretamente.');
        return true;
      } else if (response.ok) {
        showSuccess('Conexão OK!', 'A API está respondendo corretamente.');
        return true;
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      showError('Erro de conexão', 'Não foi possível conectar com a API. Verifique a URL.');
      return false;
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Erro', 'Por favor, digite a URL da API');
      return;
    }

    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      Alert.alert('Erro', 'A URL deve começar com http:// ou https://');
      return;
    }

    setLoading(true);

    try {
      // Testar conexão primeiro
      const connectionOk = await testConnection(apiUrl.trim());
      
      if (connectionOk) {
        // Salvar configuração
        await AsyncStorage.setItem('api_base_url', apiUrl.trim());
        updateApiHost(apiUrl.trim());
        
        showSuccess('Configuração salva!', 'A URL da API foi atualizada com sucesso.');
        
        // Voltar para o perfil após 1 segundo
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      showError('Erro ao salvar', 'Não foi possível salvar a configuração.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Resetar Configuração',
      'Deseja voltar para a configuração padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetar', 
          style: 'destructive',
          onPress: () => {
            setApiUrl('http://192.168.1.12:8080/api');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurar API</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="globe" size={40} color="#3B82F6" />
            </View>

            <Text style={styles.formTitle}>Configuração da API</Text>
            <Text style={styles.formSubtitle}>
              Configure a URL do servidor da API
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL da API</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="globe-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="http://192.168.1.12:8080/api"
                  placeholderTextColor="#9CA3AF"
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Dicas:</Text>
                <Text style={styles.infoItem}>• Use o IP da sua rede local</Text>
                <Text style={styles.infoItem}>• Certifique-se que o servidor está rodando</Text>
                <Text style={styles.infoItem}>• A URL deve incluir http:// ou https://</Text>
                <Text style={styles.infoItem}>• Exemplo: http://192.168.1.100:8080/api</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.testButton, testingConnection && styles.testButtonDisabled]}
                onPress={() => testConnection(apiUrl)}
                disabled={testingConnection || !apiUrl.trim()}
              >
                {testingConnection ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="wifi-outline" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.testButtonText}>
                  {testingConnection ? 'Testando...' : 'Testar Conexão'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Ionicons name="refresh-outline" size={20} color="#6B7280" />
                <Text style={styles.resetButtonText}>Resetar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading || !apiUrl.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar Configuração</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#111827',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 50,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ApiConfigScreen;