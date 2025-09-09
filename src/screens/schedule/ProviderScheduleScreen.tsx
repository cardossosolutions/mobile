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

interface ProviderDetails {
  id: number;
  name: string;
  residence: string;
  mobile: string;
  rg: string;
  cpf: string;
  plate: string | null;
  date_start: string;
  date_ending: string;
  observation: string;
}

const ProviderCard: React.FC<{ provider: ProviderDetails; onPress: () => void }> = ({ provider, onPress }) => {
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
        <View style={[styles.iconContainer, { backgroundColor: '#6366F1' }]}>
          <Ionicons name="briefcase" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerCpf}>CPF: {provider.cpf}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#EDE9FE' }]}>
          <Text style={[styles.statusText, { color: '#5B21B6' }]}>Prestador</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Residência: {provider.residence}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDateRange(provider.date_start, provider.date_ending)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{provider.mobile}</Text>
        </View>

        {provider.plate && (
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{provider.plate}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ProviderScheduleScreen: React.FC = () => {
  const { showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [providers, setProviders] = useState<ProviderDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadProviderData = useCallback(async (page: number = 1, search?: string, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      }
      
      let endpoint = `/provider/list-providers?page=${page}`;
      if (search && search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(endpoint, { method: 'GET' });
      
      if (response && response.data && Array.isArray(response.data)) {
        const newProviders = response.data;
        
        if (reset || page === 1) {
          setProviders(newProviders);
        } else {
          setProviders(prev => [...prev, ...newProviders]);
        }
        
        setCurrentPage(response.current_page);
        setHasNextPage(response.current_page < response.last_page);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar prestadores:', error);
      showError('Erro ao carregar prestadores', 'Não foi possível carregar os prestadores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadProviderData(1, '', true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProviderData(1, searchTerm, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadProviderData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProviderData(1, searchTerm, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      loadProviderData(currentPage + 1, searchTerm, false);
    }
  };

  const renderProviderItem = ({ item }: { item: ProviderDetails }) => (
    <ProviderCard provider={item} onPress={() => {}} />
  );

  const renderFooter = () => {
    if (!loading || providers.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Prestadores de Serviços</Text>
        <Text style={styles.headerSubtitle}>
          {providers.length} {providers.length === 1 ? 'prestador' : 'prestadores'}
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar prestador, CPF ou observação..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {loading && providers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Carregando prestadores...</Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          renderItem={renderProviderItem}
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
              <Ionicons name="briefcase-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Nenhum prestador encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm 
                  ? 'Não há prestadores para a busca realizada.'
                  : 'Não há prestadores cadastrados no momento.'}
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
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  providerCpf: {
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

export default ProviderScheduleScreen;