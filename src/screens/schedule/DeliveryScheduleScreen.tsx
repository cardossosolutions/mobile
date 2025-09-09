import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiRequest } from '../../config/api';
import { useToast } from '../../contexts/ToastContext';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryDetails[]>([]);
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

  const renderDeliveryItem = ({ item }: { item: DeliveryDetails }) => (
    <DeliveryCard delivery={item} onPress={() => {}} />
  );

  const renderFooter = () => {
    if (!loading || deliveries.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#F59E0B" />
      </View>
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
});

export default DeliveryScheduleScreen;