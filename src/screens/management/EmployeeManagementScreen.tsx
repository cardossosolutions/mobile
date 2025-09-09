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

interface Employee {
  id: string;
  name: string;
  email: string;
  permission: string;
  status: string;
}

const EmployeeCard: React.FC<{ employee: Employee; onEdit: () => void; onDelete: () => void }> = ({ 
  employee, 
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status: string) => {
    return status === 'active' ? '#D1FAE5' : '#FEE2E2';
  };

  const getStatusTextColor = (status: string) => {
    return status === 'active' ? '#065F46' : '#991B1B';
  };

  const getPermissionColor = (permission: string) => {
    return permission === 'Administrador' ? '#EDE9FE' : '#DBEAFE';
  };

  const getPermissionTextColor = (permission: string) => {
    return permission === 'Administrador' ? '#5B21B6' : '#1E40AF';
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeeEmail}>{employee.email}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: getPermissionColor(employee.permission) }]}>
            <Text style={[styles.badgeText, { color: getPermissionTextColor(employee.permission) }]}>
              {employee.permission}
            </Text>
          </View>
          
          <View style={[styles.badge, { backgroundColor: getStatusColor(employee.status) }]}>
            <Text style={[styles.badgeText, { color: getStatusTextColor(employee.status) }]}>
              {employee.status === 'active' ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
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

const EmployeeManagementScreen: React.FC = () => {
  const { employees, loadEmployees, deleteEmployee } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmployees(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadEmployees]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmployees(1, searchTerm).finally(() => setRefreshing(false));
  };

  const handleEdit = (employee: Employee) => {
    Alert.alert('Editar Funcionário', `Editar ${employee.name}`);
  };

  const handleDelete = (employee: Employee) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o funcionário "${employee.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(employee.id);
              handleRefresh();
            } catch (error) {
              console.error('Erro ao excluir funcionário:', error);
            }
          }
        }
      ]
    );
  };

  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <EmployeeCard 
      employee={item} 
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Funcionários</Text>
        <Text style={styles.headerSubtitle}>
          {employees.length} {employees.length === 1 ? 'funcionário' : 'funcionários'}
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou email..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading && employees.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando funcionários...</Text>
        </View>
      ) : (
        <FlatList
          data={employees}
          renderItem={renderEmployeeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Nenhum funcionário encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm 
                  ? 'Não há funcionários para a busca realizada.'
                  : 'Não há funcionários cadastrados no momento.'}
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardContent: {
    padding: 16,
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

export default EmployeeManagementScreen;