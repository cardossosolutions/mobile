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
import { Picker } from '@react-native-picker/picker';
import { apiRequest, API_CONFIG } from '../../config/api';
import { useToast } from '../../contexts/ToastContext';

interface Delivery {
  id?: number;
  ecommerce: string;
  ecommerce_id: number | null;
  quantity: number;
  date_start: string;
  date_ending: string;
}

interface Ecommerce {
  id: number;
  name: string;
}

interface DeliveryFormProps {
  delivery?: Delivery;
  onSave: () => void;
  onCancel: () => void;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ delivery, onSave, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingEcommerces, setLoadingEcommerces] = useState(true);
  const [ecommerces, setEcommerces] = useState<Ecommerce[]>([]);
  const [formData, setFormData] = useState<Delivery>({
    ecommerce: delivery?.ecommerce || '',
    ecommerce_id: delivery?.ecommerce_id || 0,
    quantity: delivery?.quantity || 1,
    date_start: delivery?.date_start ? formatDateToInput(delivery.date_start) : getCurrentDate(),
    date_ending: delivery?.date_ending ? formatDateToInput(delivery.date_ending) : getCurrentDate()
  });
  const [customEcommerce, setCustomEcommerce] = useState('');
  const [selectedEcommerceName, setSelectedEcommerceName] = useState('');

  // Função para obter data atual no formato MM/DD/YYYY
  function getCurrentDate(): string {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Função para formatar data do backend (YYYY-MM-DD) para input (DD/MM/YYYY)
  function formatDateToInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return getCurrentDate();
    }
  }

  // Função para formatar data do input (DD/MM/YYYY) para backend (YYYY-MM-DD)
  function formatDateToBackend(dateString: string): string {
    if (!dateString) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch {
      return '';
    }
  }

  // Função para validar formato de data DD/MM/YYYY
  function isValidDateFormat(dateString: string): boolean {
    const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    // Validar se a data é válida
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  }

  // Função para formatar input de data enquanto digita DD/MM/YYYY
  function formatDateInput(text: string): string {
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
  }

  // Carregar lista de e-commerces da API
  React.useEffect(() => {
    const loadEcommerces = async () => {
      setLoadingEcommerces(true);
      try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.ECOMMERCES, {
          method: 'GET'
        });
        
        if (response && Array.isArray(response)) {
          setEcommerces(response);
        } else {
          console.warn('Resposta da API de e-commerces não é um array:', response);
          setEcommerces([]);
        }
      } catch (error) {
        console.error('Erro ao carregar e-commerces:', error);
        // Fallback com lista básica em caso de erro
        setEcommerces([
          { id: 1, name: 'Amazon' },
          { id: 2, name: 'Mercado Livre' },
          { id: 3, name: 'Shopee' },
          { id: 4, name: 'Magazine Luiza' },
          { id: 5, name: 'Americanas' }
        ]);
      } finally {
        setLoadingEcommerces(false);
      }
    };

    loadEcommerces();
  }, []);

  const handleEcommerceChange = (ecommerceId: number) => {
    if (ecommerceId === -1) {
      // Opção "Outros" selecionada
      setFormData({
        ...formData,
        ecommerce_id: -1,
        ecommerce: 'Outros'
      });
      setSelectedEcommerceName('Outros');
    } else {
      const selectedEcommerce = ecommerces.find(e => e.id === ecommerceId);
      setFormData({
        ...formData,
        ecommerce_id: ecommerceId,
        ecommerce: selectedEcommerce ? selectedEcommerce.name : ''
      });
      setSelectedEcommerceName(selectedEcommerce ? selectedEcommerce.name : '');
      setCustomEcommerce('');
    }
  };

  const handleDateChange = (field: 'date_start' | 'date_ending', text: string) => {
    const formattedDate = formatDateInput(text);
    setFormData({
      ...formData,
      [field]: formattedDate
    });
  };

  const handleSave = async () => {
    // Validações
    if (!formData.ecommerce_id || formData.ecommerce_id === 0) {
      Alert.alert('Erro', 'Selecione um e-commerce');
      return;
    }

    if (formData.ecommerce_id === -1 && !customEcommerce.trim()) {
      Alert.alert('Erro', 'Digite o nome do e-commerce');
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

    if (formData.quantity < 1) {
      Alert.alert('Erro', 'Quantidade deve ser maior que zero');
      return;
    }

    setLoading(true);
    try {
      // Preparar payload conforme especificado
      const payload = {
        ecommerce: formData.ecommerce_id === -1 ? 'Outros' : selectedEcommerceName,
        other_name: formData.ecommerce_id === -1 ? customEcommerce.trim() : '',
        quantity: formData.quantity,
        date_start: formatDateToBackend(formData.date_start),
        date_ending: formatDateToBackend(formData.date_ending)
      };

      let response;
      if (delivery?.id) {
        // PUT para alterar
        response = await apiRequest(`${API_CONFIG.ENDPOINTS.DELIVERIES}/${delivery.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        // POST para criar
        response = await apiRequest(API_CONFIG.ENDPOINTS.DELIVERIES, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      // Mostrar mensagem de sucesso
      if (response && response.message) {
        showSuccess('Sucesso!', response.message);
      } else {
        showSuccess(
          delivery ? 'Entrega atualizada!' : 'Entrega cadastrada!',
          delivery ? 'A entrega foi atualizada com sucesso.' : 'A entrega foi cadastrada com sucesso.'
        );
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar entrega:', error);
      showError(
        'Erro ao salvar entrega',
        'Não foi possível salvar a entrega. Verifique os dados e tente novamente.'
      );
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
          {delivery ? 'Editar Entrega' : 'Nova Entrega'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Entrega</Text>
          
          {loadingEcommerces ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#F59E0B" />
              <Text style={styles.loadingText}>Carregando e-commerces...</Text>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-commerce / Loja *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.ecommerce_id}
                    onValueChange={handleEcommerceChange}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione um e-commerce..." value={0} />
                    {ecommerces.map((ecommerce) => (
                      <Picker.Item
                        key={ecommerce.id}
                        label={ecommerce.name}
                        value={ecommerce.id}
                      />
                    ))}
                    <Picker.Item label="Outros" value={-1} />
                  </Picker>
                </View>
              </View>

              {formData.ecommerce_id === -1 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome do E-commerce / Loja *</Text>
                  <TextInput
                    style={styles.input}
                    value={customEcommerce}
                    onChangeText={setCustomEcommerce}
                    placeholder="Digite o nome do e-commerce"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity.toString()}
              onChangeText={(text) => setFormData({...formData, quantity: parseInt(text) || 1})}
              placeholder="1"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Período da Entrega</Text>
          
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
    color: '#111827',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  dateHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
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
    backgroundColor: '#F59E0B',
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

export default DeliveryForm;