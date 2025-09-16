import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Modal } from 'react-native';
import { apiRequest } from '../../config/api';
import { useToast } from '../../contexts/ToastContext';
import { useData } from '../../contexts/DataContext';

interface VisitorDetails {
  id: number;
  visitor_name: string;
  visitor_id: number;
  cpf: string;
  residence: string;
  visitor_mobile: string;
  rg: string | null;
  plate: string | null;
  observation: string;
  dateBegin: string;
  dateEnding: string;
  responsibles: Array<{
    name: string;
    mobile: string;
  }>;
}

const VisitorCard: React.FC<{ visitor: VisitorDetails; onPress: () => void }> = ({ visitor, onPress }) => {
  const formatDateRange = (dateBegin: string, dateEnding: string) => {
    if (dateBegin === dateEnding) {
      return dateBegin;
    }
    return `${dateBegin} até ${dateEnding}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.visitorName}>{visitor.visitor_name}</Text>
          <Text style={styles.visitorCpf}>CPF: {visitor.cpf}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Agendado</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Residência: {visitor.residence}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDateRange(visitor.dateBegin, visitor.dateEnding)}
          </Text>
        </View>

        {visitor.plate && (
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{visitor.plate}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{visitor.visitor_mobile}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const VisitorScheduleScreen: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { registerAction } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visitors, setVisitors] = useState<VisitorDetails[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadVisitorData = useCallback(async (page: number = 1, search?: string, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      }
      
      let endpoint = `/visitors/schedule?page=${page}`;
      if (search && search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const data = await apiRequest(endpoint, { method: 'GET' });
      
      if (data && data.data && Array.isArray(data.data)) {
        const newVisitors = data.data;
        
        if (reset || page === 1) {
          setVisitors(newVisitors);
        } else {
          setVisitors(prev => [...prev, ...newVisitors]);
        }
        
        setCurrentPage(data.current_page);
        setHasNextPage(data.current_page < data.last_page);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar visitantes:', error);
      showError('Erro ao carregar agendamentos', 'Não foi possível carregar os agendamentos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadVisitorData(1, '', true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVisitorData(1, searchTerm, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadVisitorData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVisitorData(1, searchTerm, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      loadVisitorData(currentPage + 1, searchTerm, false);
    }
  };

  const handleCameraPress = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à câmera para capturar fotos.');
      return;
    }

    Alert.alert(
      'Capturar Foto',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => openCamera() },
        { text: 'Galeria', onPress: () => openGallery() }
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handlePhotoCapture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir câmera:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handlePhotoCapture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const handlePhotoCapture = async (imageUri: string) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('plate', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'plate.jpg',
      } as any);

      const response = await apiRequest('/visitors/schedule', {
        method: 'POST',
        body: formData,
      }, true);

      if (response && response.data && Array.isArray(response.data)) {
        setVisitors(response.data);
        
        if (response.data.length === 1) {
          setSelectedVisitor(response.data[0]);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar foto:', error);
      showError('Erro ao enviar foto', 'Não foi possível processar a foto da placa.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAction = async (eventId: number, action: string) => {
    try {
      await registerAction({
        event_id: eventId,
        action: action,
        type: 'schedule'
      });
      
      // Recarregar dados após registrar ação
      loadVisitorData(1, searchTerm, true);
    } catch (error) {
      console.error('Erro ao registrar ação:', error);
    }
  };

  const renderVisitorItem = ({ item }: { item: VisitorDetails }) => (
    <VisitorCard visitor={item} onPress={() => {
      setSelectedVisitor(item);
      setShowDetailsModal(true);
    }} />
  );

  const renderFooter = () => {
    if (!loading || visitors.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  const VisitorDetailsModal: React.FC = () => {
    if (!selectedVisitor) return null;

    const formatDateRange = (dateBegin: string, dateEnding: string) => {
      if (dateBegin === dateEnding) {
        return dateBegin;
      }
      return `${dateBegin} até ${dateEnding}`;
    };

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalhes do Visitante</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.visitorHeader}>
              <View style={styles.visitorAvatar}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.visitorInfo}>
                <Text style={styles.visitorNameLarge}>{selectedVisitor.visitor_name}</Text>
                <Text style={styles.visitorCpfLarge}>CPF: {selectedVisitor.cpf}</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Nome Completo</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.visitor_name}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="card-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>CPF</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.cpf}</Text>
                </View>
              </View>

              {selectedVisitor.rg && (
                <View style={styles.detailItem}>
                  <Ionicons name="card-outline" size={20} color="#6B7280" />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>RG</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.rg}</Text>
                  </View>
                </View>
              )}

              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Telefone</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.visitor_mobile}</Text>
                </View>
              </View>

              {selectedVisitor.plate && (
                <View style={styles.detailItem}>
                  <Ionicons name="car-outline" size={20} color="#6B7280" />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Placa do Veículo</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.plate}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Informações da Visita</Text>
              
              <View style={styles.detailItem}>
                <Ionicons name="home-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Residência</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.residence}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Período da Visita</Text>
                  <Text style={styles.detailValue}>
                    {formatDateRange(selectedVisitor.dateBegin, selectedVisitor.dateEnding)}
                  </Text>
                </View>
              </View>

              {selectedVisitor.observation && (
                <View style={styles.detailItem}>
                  <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Observações</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.observation}</Text>
                  </View>
                </View>
              )}
            </View>

            {selectedVisitor.responsibles && selectedVisitor.responsibles.length > 0 && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Responsáveis</Text>
                {selectedVisitor.responsibles.map((responsible, index) => (
                  <View key={index} style={styles.responsibleItem}>
                    <View style={styles.responsibleIcon}>
                      <Ionicons name="person-circle-outline" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.responsibleInfo}>
                      <Text style={styles.responsibleName}>{responsible.name}</Text>
                      <Text style={styles.responsiblePhone}>{responsible.mobile}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionsSection}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.entryButton]}
                onPress={() => handleRegisterAction(selectedVisitor.id, 'entry')}
              >
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Registrar Entrada</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.exitButton]}
                onPress={() => handleRegisterAction(selectedVisitor.id, 'exit')}
              >
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Registrar Saída</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Agendamentos de Visitantes</Text>
        <Text style={styles.headerSubtitle}>
          {visitors.length} {visitors.length === 1 ? 'agendamento' : 'agendamentos'}
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar visitante, CPF ou responsável..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Ionicons name="camera" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading && visitors.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando agendamentos...</Text>
        </View>
      ) : (
        <FlatList
          data={visitors}
          renderItem={renderVisitorItem}
          keyExtractor={(item) => `${item.id}-${item.visitor_id}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
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
      
      <VisitorDetailsModal />
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
  cameraButton: {
    width: 48,
    height: 48,
    backgroundColor: '#10B981',
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  visitorCpf: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
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
  footerLoader: {
    padding: 20,
    alignItems: 'center',
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
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  visitorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  visitorCpfLarge: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  responsibleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  responsibleIcon: {
    marginRight: 12,
  },
  responsibleInfo: {
    flex: 1,
  },
  responsibleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  responsiblePhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  entryButton: {
    backgroundColor: '#10B981',
  },
  exitButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VisitorScheduleScreen;