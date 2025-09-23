import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../contexts/DataContext';


interface ServiceProvider {
  id?: number;
  name: string;
  mobile: string;
  rg: string;
  cpf: string;
  plate: string | null;
  date_start: string;
  date_ending: string;
  observation: string;
}

interface ServiceProviderFormProps {
  provider?: ServiceProvider;
  onSave: () => void;
  onCancel: () => void;
}

const ServiceProviderForm: React.FC<ServiceProviderFormProps> = ({ provider, onSave, onCancel }) => {
  const { addServiceProvider, updateServiceProvider } = useData();
  const [loading, setLoading] = useState(false);

  // Função para obter data atual no formato DD/MM/YYYY
  const getCurrentDate = (): string => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para formatar data do backend (YYYY-MM-DD) para input (DD/MM/YYYY)
  const formatDateToInput = (dateString: string): string => {
    if (!dateString) return getCurrentDate();
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return getCurrentDate();
    }
  };

  // Função para formatar data do input (DD/MM/YYYY) para backend (YYYY-MM-DD)
  const formatDateToBackend = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  // Função para validar formato de data DD/MM/YYYY
  const isValidDateFormat = (dateString: string): boolean => {
    const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    // Validar se a data é válida
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  // Função para formatar input de data enquanto digita DD/MM/YYYY
  const formatDateInput = (text: string): string => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const [formData, setFormData] = useState<ServiceProvider>({
    name: provider?.name || '',
    mobile: provider?.mobile || '',
    rg: provider?.rg || '',
    cpf: provider?.cpf || '',
    plate: provider?.plate || '',
    date_start: provider?.date_start ? formatDateToInput(provider.date_start) : getCurrentDate(),
    date_ending: provider?.date_ending ? formatDateToInput(provider.date_ending) : getCurrentDate(),
    observation: provider?.observation || ''
  });

  const handleDateChange = (field: 'date_start' | 'date_ending', text: string) => {
    const formattedDate = formatDateInput(text);
    setFormData({
      ...formData,
      [field]: formattedDate
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.cpf.trim() || !formData.mobile.trim()) {
      Alert.alert('Erro', 'Nome, CPF e telefone são obrigatórios');
      return;
    }

    if (!formData.date_start || !formData.date_ending) {
      Alert.alert('Erro', 'Datas de início e fim são obrigatórias');
      return;
    }

    if (!isValidDateFormat(formData.date_start) || !isValidDateFormat(formData.date_ending)) {
      Alert.alert('Erro', 'Use o formato DD/MM/YYYY para as datas');
      return;
    }

    // Validar se data de início não é posterior à data de fim
    const startDate = new Date(formatDateToBackend(formData.date_start));
    const endDate = new Date(formatDateToBackend(formData.date_ending));
    
    if (startDate > endDate) {
      Alert.alert('Erro', 'A data de início não pode ser posterior à data de fim');
      return;
    }

    setLoading(true);
    try {
      // Preparar dados com datas no formato correto para o backend
      const dataToSend = {
        ...formData,
        date_start: formatDateToBackend(formData.date_start),
        date_ending: formatDateToBackend(formData.date_ending)
      };

      if (provider?.id) {
        await updateServiceProvider(provider.id, dataToSend);
      } else {
        await addServiceProvider(dataToSend);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar prestador:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {provider ? 'Editar Prestador' : 'Novo Prestador'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Digite o nome completo"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF *</Text>
            <TextInput
              style={styles.input}
              value={formData.cpf}
              onChangeText={(text) => setFormData({...formData, cpf: text})}
              placeholder="000.000.000-00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>RG *</Text>
            <TextInput
              style={styles.input}
              value={formData.rg}
              onChangeText={(text) => setFormData({...formData, rg: text})}
              placeholder="Digite o RG"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone *</Text>
            <TextInput
              style={styles.input}
              value={formData.mobile}
              onChangeText={(text) => setFormData({...formData, mobile: text})}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Placa do Veículo</Text>
            <TextInput
              style={styles.input}
              value={formData.plate || ''}
              onChangeText={(text) => setFormData({...formData, plate: text})}
              placeholder="ABC-1234"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Período do Serviço</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Início *</Text>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={formData.date_start}
              onChangeText={(text) => handleDateChange('date_start', text)}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={10}
            />
            <View style={styles.dateIcon}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Fim *</Text>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={formData.date_ending}
              onChangeText={(text) => handleDateChange('date_ending', text)}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={10}
            />
            <View style={styles.dateIcon}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
          </View>

          <Text style={styles.dateHint}>
            💡 Use o formato DD/MM/YYYY (exemplo: 25/12/2024)
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.observation}
              onChangeText={(text) => setFormData({...formData, observation: text})}
              placeholder="Observações sobre o serviço"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Salvar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    paddingRight: 40,
  },
  dateIcon: {
    position: 'absolute',
    right: 12,
    top: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
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

export default ServiceProviderForm;