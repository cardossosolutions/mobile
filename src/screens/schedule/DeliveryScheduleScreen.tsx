import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '../../config/api';
import { useToast } from '../../contexts/ToastContext';
import { useData } from '../../contexts/DataContext';

interface DeliveryDetails {
  id: number;
  residence: string;
  ecommerce_id: number | null;
  ecommerce: string;
  quantity: number;
  date_start: string;
  date_ending: string;
}

const DeliveryCard: React.FC<{ delivery: DeliveryDetails; onPress: () => void }> = ({ delivery, onPress }) => {
  const formatDateRange = (dateStart: string, dateEnding: string) => {
    const start = new Date(dateStart).toLocaleDateString('pt-BR');
    const end = new Date(dateEnding).toLocaleDateString('pt-BR');
    
    if (start === end) {
      return start;
    }
    return `${start} até ${end}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#F59E0B' }]}>
          <Ionicons name="cube" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.deliveryName}>{delivery.ecommerce}</Text>
          <Text style={styles.deliveryQuantity}>
            {delivery.quantity} {delivery.quantity === 1 ? 'entrega' : 'entregas'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: delivery.ecommerce_id ? '#D1FAE5' : '#FEF3C7' }]}>
          <Text style={[styles.statusText, { color: delivery.ecommerce_id ? '#065F46' : '#92400E' }]}>
            {delivery.ecommerce_id ? 'E-commerce' : 'Outros'}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Residência: {delivery.residence}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDateRange(delivery.date_start, delivery.date_ending)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DeliveryScheduleScreen: React.FC = () => {
  const { showError } = useToast();
  const { registerAction } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryDetails[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadDeliveryData = useCallback(async (page: number = 1, search?: string, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      }
      
      let endpoint = `/deliveries?page=${page}`;
      if (search && search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(endpoint, { method: 'GET' });
      
      if (response && response.data && Array.isArray(response.data)) {
        const newDeliveries = response.data;
        
        if (reset || page === 1) {
          setDeliveries(newDeliveries);
        } else {
          setDeliveries(prev => [...prev, ...newDeliveries]);
        }
        
        setCurrentPage(response.current_page);
        setHasNextPage(response.current_page < response.last_page);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar entregas:', error);
      showError('Erro ao carregar entregas', 'Não foi possível carregar as entregas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadDeliveryData(1, '', true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDeliveryData(1, searchTerm, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadDeliveryData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeliveryData(1, searchTerm, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      loadDeliveryData(currentPage + 1, searchTerm, false);
    }
  };

  const handleRegisterAction = async (deliveryId: number, action: string) => {
    try {
      await registerAction({
        delivery_id: deliveryId,
        action: action,
        type: 'delivery'
      });
      
      // Recarregar dados após registrar ação
      loadDeliveryData(1, searchTerm, true);
    } catch (error) {
      console.error('Erro ao registrar ação:', error);
    }
  };

  const renderDeliveryItem = ({ item }: { item: DeliveryDetails }) => (
    <DeliveryCard delivery={item} onPress={() => {
      setSelectedDelivery(item);
      setShowDetailsModal(true);
    }} />
  );

  const renderFooter = () => {
    if (!loading || deliveries.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#F59E0B" />
      </View>
    );
  };

  const DeliveryDetailsModal: React.FC = () => {
    if (!selectedDelivery) return null;

    const formatDateRange = (dateStart: string, dateEnding: string) => {
      const start = new Date(dateStart).toLocaleDateString('pt-BR');
      const end = new Date(dateEnding).toLocaleDateString('pt-BR');
      
      if (start === end) {
        return start;
      }
      return `${start} até ${end}`;
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
            <Text style={styles.modalTitle}>Detalhes da Entrega</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryAvatar}>
                <Ionicons name="cube" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryNameLarge}>{selectedDelivery.ecommerce}</Text>
                <Text style={styles.deliveryQuantityLarge}>
                  {selectedDelivery.quantity} {selectedDelivery.quantity === 1 ? 'entrega' : 'entregas'}
                </Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: selectedDelivery.ecommerce_id ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={[styles.typeText, { color: selectedDelivery.ecommerce_id ? '#065F46' : '#92400E' }]}>
                  {selectedDelivery.ecommerce_id ? 'E-commerce' : 'Outros'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Informações da Entrega</Text>
              
              <View style={styles.detailItem}>
                <Ionicons name="storefront-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>E-commerce / Loja</Text>
                  <Text style={styles.detailValue}>{selectedDelivery.ecommerce}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="home-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Residência</Text>
                  <Text style={styles.detailValue}>{selectedDelivery.residence}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Quantidade</Text>
                  <Text style={styles.detailValue}>
                    {selectedDelivery.quantity} {selectedDelivery.quantity === 1 ? 'entrega' : 'entregas'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Período de Entrega</Text>
                  <Text style={styles.detailValue}>
                    {formatDateRange(selectedDelivery.date_start, selectedDelivery.date_ending)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>
                    {selectedDelivery.ecommerce_id ? 'E-commerce Cadastrado' : 'Entrega Avulsa'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.receiveButton]}
                onPress={() => handleRegisterAction(selectedDelivery.id, 'receive')}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Registrar Recebimento</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.deliverButton]}
                onPress={() => handleRegisterAction(selectedDelivery.id, 'deliver')}
              >
                <Ionicons name="arrow-forward-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Registrar Entrega</Text>
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
        colors={['#F59E0B', '#D97706']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Entregas Programadas</Text>
        <Text style={styles.headerSubtitle}>
          {deliveries.length} {deliveries.length === 1 ? 'entrega' : 'entregas'}
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar e-commerce ou residência..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {loading && deliveries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Carregando entregas...</Text>
        </View>
      ) : (
        <FlatList
          data={deliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Nenhuma entrega encontrada</Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm 
                  ? 'Não há entregas para a busca realizada.'
                  : 'Não há entregas cadastradas no momento.'}
              </Text>
            </View>
          }
        />
      )}
      
      <DeliveryDetailsModal />
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
    padding: 16,
  },
  searchInputContainer: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  deliveryQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
  deliveryHeader: {
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
  deliveryAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  deliveryQuantityLarge: {
    fontSize: 16,
    color: '#6B7280',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
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
  receiveButton: {
    backgroundColor: '#10B981',
  },
  deliverButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DeliveryScheduleScreen;