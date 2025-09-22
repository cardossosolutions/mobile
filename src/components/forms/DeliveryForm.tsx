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
import { useData } from '../../contexts/DataContext';

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
  const { addDelivery, updateDelivery } = useData();
  const [loading, setLoading] = useState(false);
  const [loadingEcommerces, setLoadingEcommerces] = useState(true);
  const [ecommerces, setEcommerces] = useState<Ecommerce[]>([]);
  const [formData, setFormData] = useState<Delivery>({
    ecommerce: delivery?.ecommerce || '',
    ecommerce_id: delivery?.ecommerce_id || null,
    quantity: delivery?.quantity || 1,
    date_start: delivery?.date_start ? formatDateToInput(delivery.date_start) : '',
    date_ending: delivery?.date_ending ? formatDateToInput(delivery.date_ending) : ''
  });

  // Função para formatar data do backend (YYYY-MM-DD) para input (MM/DD/YYYY)
  function formatDateToInput(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  }

  // Função para formatar data do input (MM/DD/YYYY) para backend (YYYY-MM-DD)
  function formatDateToBackend(dateString: string): string {
    if (!dateString) return '';
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Função para validar formato de data MM/DD/YYYY
  function isValidDateFormat(dateString: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    return regex.test(dateString);
  }

  // Carregar lista de e-commerces
  React.useEffect(() => {
    const loadEcommerces = async () => {
      setLoadingEcommerces(true);
      try {
        // Simulando lista de e-commerces - substitua pela chamada real da API
        const mockEcommerces = [
          { id: 1, name: 'Amazon' },
          { id: 2, name: 'Mercado Livre' },
          { id: 3, name: 'Shopee' },
          { id: 4, name: 'Magazine Luiza' },
          { id: 5, name: 'Americanas' },
          { id: 6, name: 'Casas Bahia' },
          { id: 7, name: 'Submarino' },
          { id: 8, name: 'Extra' },
          { id: 9, name: 'Ponto Frio' },
          { id: 10, name: 'Outros' }
        ];
        setEcommerces(mockEcommerces);
      } catch (error) {
        console.error('Erro ao carregar e-commerces:', error);
      } finally {
        setLoadingEcommerces(false);
      }
    };

    loadEcommerces();
  }, []);
  const handleSave = async () => {
    if (!formData.ecommerce_id && !formData.ecommerce.trim()) {
      Alert.alert('Erro', 'Selecione um e-commerce ou digite o nome');
      return;
    }

    if (!formData.date_start || !formData.date_ending) {
      Alert.alert('Erro', 'Datas de início e fim são obrigatórias');
      return;
    }

    if (!isValidDateFormat(formData.date_start) || !isValidDateFormat(formData.date_ending)) {
      Alert.alert('Erro', 'Use o formato MM/DD/YYYY para as datas');
      return;
    }

    if (formData.quantity < 1) {
      Alert.alert('Erro', 'Quantidade deve ser maior que zero');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        date_start: formatDateToBackend(formData.date_start),
        date_ending: formatDateToBackend(formData.date_ending)
      };

      if (delivery?.id) {
        await updateDelivery(delivery.id, dataToSave);
      } else {
        await addDelivery(dataToSave);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar entrega:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEcommerceChange = (ecommerceId: number | null) => {
    const selectedEcommerce = ecommerces.find(e => e.id === ecommerceId);
    setFormData({
      ...formData,
      ecommerce_id: ecommerceId,
      ecommerce: selectedEcommerce ? selectedEcommerce.name : ''
    });
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-commerce / Loja *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.ecommerce_id}
                  onValueChange={handleEcommerceChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um e-commerce..." value={null} />
                  {ecommerces.map((ecommerce) => (
                    <Picker.Item
                      key={ecommerce.id}
                      label={ecommerce.name}
                      value={ecommerce.id}
                    />
                  ))}
                </Picker>
              </View>
              
              {formData.ecommerce_id === 10 && (
                <View style={styles.customInputGroup}>
                  <Text style={styles.label}>Nome personalizado *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.ecommerce}
                    onChangeText={(text) => setFormData({...formData, ecommerce: text})}
                    placeholder="Digite o nome do e-commerce"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>
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
            <Text style={styles.label}>Data de Início * (MM/DD/YYYY)</Text>
            <TextInput
              style={styles.input}
              value={formData.date_start}
              onChangeText={(text) => setFormData({...formData, date_start: text})}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Fim * (MM/DD/YYYY)</Text>
            <TextInput
              style={styles.input}
              value={formData.date_ending}
              onChangeText={(text) => setFormData({...formData, date_ending: text})}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          
          <Text style={styles.dateHint}>
            💡 Use o formato MM/DD/YYYY (exemplo: 12/25/2024)
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
  },
  customInputGroup: {
    marginTop: 12,
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