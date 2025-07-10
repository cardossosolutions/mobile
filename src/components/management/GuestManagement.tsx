import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import GuestForm from '../forms/GuestForm';

const GuestManagement: React.FC = () => {
  const { guests, loadGuests, deleteGuest } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingGuestData, setLoadingGuestData] = useState<Record<string, boolean>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    guest: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    guest: null,
    loading: false
  });

  // Carregar convidados quando o componente for montado
  useEffect(() => {
    console.log('👤 GuestManagement montado - carregando convidados...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        await loadGuests();
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.cpf.includes(searchTerm) ||
    (guest.rg && guest.rg.includes(searchTerm)) ||
    (guest.plate && guest.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
    guest.residence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = async (guest: any) => {
    setLoadingGuestData(prev => ({ ...prev, [guest.id]: true }));
    try {
      console.log(`📝 Carregando dados do convidado ${guest.id} para edição...`);
      
      // Fazer requisição para obter dados completos do convidado
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${guest.id}`, {
        method: 'GET'
      });
      
      console.log('✅ Dados do convidado carregados:', response);
      
      if (response) {
        // Converter dados da API para o formato esperado pelo formulário
        const guestData = {
          id: response.id,
          name: response.name,
          residence: response.residence,
          cpf: response.cpf,
          rg: '', // RG não vem na resposta, manter vazio
          plate: response.plate,
          observation: '', // Observação não vem na resposta, manter vazio
          type: 'visitor'
        };
        
        setEditingGuest(guestData);
        setIsModalOpen(true);
      } else {
        console.error('❌ Dados do convidado não encontrados');
        // Fallback para dados básicos se a API falhar
        setEditingGuest(guest);
        setIsModalOpen(true);
      }
    } finally {
      setLoadingGuestData(prev => ({ ...prev, [guest.id]: false }));
    }
  };

  const handleDeleteClick = (guest: any) => {
    setDeleteConfirmation({
      isOpen: true,
      guest,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.guest) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteGuest(deleteConfirmation.guest.id);
      
      setDeleteConfirmation({
        isOpen: false,
        guest: null,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao excluir convidado:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      guest: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Convidados</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Convidado</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, residência ou placa do veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Tabela de convidados */}
          {!initialLoading && (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Residência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-orange-100 p-2 rounded-full mr-3">
                          <UserCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{guest.residence}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>CPF: {guest.cpf}</div>
                      {guest.rg && <div className="text-gray-500">RG: {guest.rg}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.plate || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(guest)}
                          disabled={loadingGuestData[guest.id]}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          {loadingGuestData[guest.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(guest)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredGuests.length === 0 && !initialLoading && (
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum convidado encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <GuestForm
          guest={editingGuest}
          onClose={handleCloseModal}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o convidado "${deleteConfirmation.guest?.name}"? Esta ação não pode ser desfeita e todos os agendamentos relacionados também serão removidos.`}
        confirmText="Excluir Convidado"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default GuestManagement;
    setEditingGuest(null);
  };
                  Residência
  return (
    <div className="space-y-6">
                  CPF
        <h1 className="text-3xl font-bold text-gray-900">Convidados</h1>
        <button
                  Veículo
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Convidado</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, residência ou placa do veículo..."
                      <div className="text-sm font-medium text-gray-900">{guest.name}</div>
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                    <div className="text-sm font-medium text-gray-900">{guest.residence}</div>

        <div className="overflow-x-auto">
                    {guest.cpf}
          {initialLoading && (
            <div className="flex items-center justify-center py-12">
                    {guest.plate || 'Não informado'}
              </div>
            </div>
          )}

          {/* Tabela de convidados */}
          {!initialLoading && (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-orange-100 p-2 rounded-full mr-3">
                          <UserCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{guest.nome}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>CPF: {guest.cpf}</div>
                      <div className="text-gray-500">RG: {guest.rg}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.placaVeiculo || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {guest.observacoes || 'Sem observações'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(guest)}
                          disabled={loadingGuestData[guest.id]}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          {loadingGuestData[guest.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(guest)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredGuests.length === 0 && !initialLoading && (
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum convidado encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <GuestForm
          guest={editingGuest}
          onClose={handleCloseModal}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o convidado "${deleteConfirmation.guest?.nome}"? Esta ação não pode ser desfeita e todos os agendamentos relacionados também serão removidos.`}
        message={`Tem certeza que deseja excluir o convidado "${deleteConfirmation.guest?.name}"? Esta ação não pode ser desfeita e todos os agendamentos relacionados também serão removidos.`}
        confirmText="Excluir Convidado"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default GuestManagement;