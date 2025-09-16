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
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../../contexts/DataContext';
import GuestForm from '../../components/forms/GuestForm';
import { Modal } from 'react-native';

interface Guest {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  plate?: string;
  observation?: string;
  residence?: string;
}

const GuestCard: React.FC<{ guest: Guest; onEdit: () => void; onDelete: () => void }> = ({ 
  guest, 
  onEdit, 
  onDelete 
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-add" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.guestName}>{guest.name}</Text>
          <Text style={styles.guestCpf}>CPF: {guest.cpf}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        {guest.rg && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>RG: {guest.rg}</Text>
          </View>
        )}
        
        {guest.plate && (
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Placa: {guest.plate}</Text>
          </View>
        )}

        {guest.observation && (
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={2}>{guest.observation}</Text>
          </View>
        )}
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

const GuestManagementScreen: React.FC = () => {
  const { guests, loadGuests, deleteGuest } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadGuests(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadGuests]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadGuests(1, searchTerm).finally(() => setRefreshing(false));
  };

  const handleEdit = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowForm(true);
  };

  const handleDelete = (guest: Guest) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o convidado "${guest.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGuest(guest.id);
              handleRefresh();
            } catch (error) {
              console.error('Erro ao excluir convidado:', error);
            }
          }
        }
      ]
    );
  };

  const renderGuestItem = ({ item }: { item: Guest }) => (
    <GuestCard 
      guest={item} 
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Convidados</Text>
        <Text style={styles.headerSubtitle}>
          {guests.length} {guests.length === 1 ? 'convidado' : 'convidados'}
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, CPF ou placa..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setSelectedGuest(null);
            setShowForm(true);
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading && guests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Carregando convidados...</Text>
        </View>
      ) : (
        <FlatList
          data={guests}
          renderItem={renderGuestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="person-add-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Nenhum convidado encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm 
                  ? 'Não há convidados para a busca realizada.'
                  : 'Não há convidados cadastrados no momento.'}
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
        <GuestForm
          guest={selectedGuest}
          onSave={() => {
            setShowForm(false);
            setSelectedGuest(null);
            handleRefresh();
          }}
          onCancel={() => {
            setShowForm(false);
            setSelectedGuest(null);
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
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  guestCpf: {
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
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
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
});

export default GuestManagementScreen;