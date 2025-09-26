import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../../contexts/DataContext';
import AppointmentForm from '../../components/forms/AppointmentForm';

interface Appointment {
  id: string;
  visitor_id: number;
  name?: string;
  cpf?: string;
  dateBegin: string;
  dateEnding: string;
}

interface Guest {
  id: string;
  name: string;
  cpf: string;
}

const AppointmentForm: React.FC<{
  appointment?: Appointment | null;
  onSave: () => void;
  onCancel: () => void
}> = ({ appointment, onSave, onCancel }) => {
  const { addAppointment, updateAppointment, guests, loadGuests } = useData();
  const [loading, setLoading] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [formData, setFormData] = useState({
    visitor_id: appointment?.visitor_id || '',
    dateBegin: appointment?.dateBegin || '',
    dateEnding: appointment?.dateEnding || ''
  });

  useEffect(() => {
    const loadGuestsList = async () => {
      setLoadingGuests(true);
      try {
        await loadGuests(1, '');
      } catch (error) {
        console.error('Erro ao carregar convidados:', error);
      } finally {
        setLoadingGuests(false);
      }
    };

    loadGuestsList();
  }, [loadGuests]);

  const handleSave = async () => {
    if (!formData.visitor_id) {
      Alert.alert('Erro', 'Selecione um convidado');
      return;
    }

    if (!formData.dateBegin || !formData.dateEnding) {
      Alert.alert('Erro', 'Datas de início e fim são obrigatórias');
      return;
    }

    setLoading(true);
    try {
      if (appointment?.id) {
        await updateAppointment(appointment.id, formData);
      } else {
        await addAppointment(formData);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o agendamento');
    } finally {
      setLoading(false);
    }
  };

  const selectedGuest = guests.find(guest => guest.id === formData.visitor_id);

  return (
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selecionar Convidado</Text>

            {loadingGuests ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text style={styles.loadingText}>Carregando convidados...</Text>
                </View>
            ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Convidado *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                          selectedValue={formData.visitor_id}
                          onValueChange={(value) => setFormData({...formData, visitor_id: value})}
                          style={styles.picker}
                      >
                        <Picker.Item label="Selecione um convidado..." value="" />
                        {guests.map((guest) => (
                            <Picker.Item
                                key={guest.id}
                                label={`${guest.name} - ${guest.cpf}`}
                                value={guest.id}
                            />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {selectedGuest && (
                      <View style={styles.selectedGuestInfo}>
                        <Text style={styles.selectedGuestTitle}>Convidado Selecionado:</Text>
                        <Text style={styles.selectedGuestName}>{selectedGuest.name}</Text>
                        <Text style={styles.selectedGuestCpf}>CPF: {selectedGuest.cpf}</Text>
                      </View>
                  )}
                </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Período da Visita</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Início *</Text>
              <TextInput
                  style={styles.input}
                  value={formData.dateBegin}
                  onChangeText={(text) => setFormData({...formData, dateBegin: text})}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Fim *</Text>
              <TextInput
                  style={styles.input}
                  value={formData.dateEnding}
                  onChangeText={(text) => setFormData({...formData, dateEnding: text})}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.dateHint}>
              💡 Use o formato DD/MM/AAAA para as datas
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
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

const AppointmentCard: React.FC<{ appointment: Appointment; onEdit: () => void; onDelete: () => void }> = ({
                                                                                                             appointment,
                                                                                                             onEdit,
                                                                                                             onDelete
                                                                                                           }) => {
  const formatDateRange = (dateBegin: string, dateEnding: string) => {
    if (dateBegin === dateEnding) {
      return dateBegin;
    }
    return `${dateBegin} até ${dateEnding}`;
  };

  return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.appointmentName}>{appointment.name || 'Convidado'}</Text>
            <Text style={styles.appointmentCpf}>CPF: {appointment.cpf || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {formatDateRange(appointment.dateBegin, appointment.dateEnding)}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
};

const AppointmentManagementScreen: React.FC = () => {
  const { appointments, loadAppointments, deleteAppointment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAppointments(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadAppointments]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments(1, searchTerm).finally(() => setRefreshing(false));
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleDelete = (appointment: Appointment) => {
    Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o agendamento para "${appointment.name || 'Convidado'}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAppointment(appointment.id);
                handleRefresh();
              } catch (error) {
                console.error('Erro ao excluir agendamento:', error);
              }
            }
          }
        ]
    );
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
      <AppointmentCard
          appointment={item}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
      />
  );

  return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
            colors={['#DC2626', '#B91C1C']}
            style={styles.header}
        >
          <Text style={styles.headerTitle}>Agendamentos</Text>
          <Text style={styles.headerSubtitle}>
            {appointments.length} {appointments.length === 1 ? 'agendamento' : 'agendamentos'}
          </Text>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome, CPF ou responsável..."
                placeholderTextColor="#9CA3AF"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
          </View>

          <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setSelectedAppointment(null);
                setShowForm(true);
              }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading && appointments.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>Carregando agendamentos...</Text>
            </View>
        ) : (
            <FlatList
                data={appointments}
                renderItem={renderAppointmentItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>Nenhum agendamento encontrado</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchTerm
                          ? 'Não há agendamentos para a busca realizada.'
                          : 'Não há agendamentos cadastrados no momento.'}
                    </Text>
                  </View>
                }
            />
        )}

        <Modal
            visible={showForm}
            animationType="slide"
            presentationStyle="fullScreen"
        >
          <AppointmentForm
              appointment={selectedAppointment}
              onSave={() => {
                setShowForm(false);
                setSelectedAppointment(null);
                handleRefresh();
              }}
              onCancel={() => {
                setShowForm(false);
                setSelectedAppointment(null);
              }}
          />
        </Modal>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  appointmentCpf: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  selectedGuestInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  selectedGuestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  selectedGuestName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  selectedGuestCpf: {
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
});

export default AppointmentManagementScreen;