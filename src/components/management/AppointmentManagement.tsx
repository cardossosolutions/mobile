import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import AppointmentForm from '../forms/AppointmentForm';

const AppointmentManagement: React.FC = () => {
  const { appointments, guests, loadAppointments, loadGuests, deleteAppointment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    appointment: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    appointment: null,
    loading: false
  });

  // Carregar agendamentos e convidados quando o componente for montado
  useEffect(() => {
    console.log('📅 AppointmentManagement montado - carregando agendamentos e convidados...');
    loadAppointments();
    loadGuests(); // Necessário para mostrar nomes dos convidados
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const guest = guests.find(g => g.id === appointment.guestId);
    const guestName = guest?.nome || '';
    
    const matchesSearch = guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || appointment.dataEntrada.includes(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (appointment: any) => {
    setDeleteConfirmation({
      isOpen: true,
      appointment,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.appointment) return;

    setDeleteConfirmation(prev => ({ ...prev, loading: true }));

    try {
      await deleteAppointment(deleteConfirmation.appointment.id);
      
      setDeleteConfirmation({
        isOpen: false,
        appointment: null,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      setDeleteConfirmation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      appointment: null,
      loading: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const getGuestName = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    return guest ? guest.nome : 'Convidado não encontrado';
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  const getStatusColor = (appointment: any) => {
    const now = new Date();
    const entryDate = new Date(appointment.dataEntrada);
    const exitDate = new Date(appointment.dataSaida);
    
    if (now < entryDate) {
      return 'bg-yellow-100 text-yellow-800'; // Agendado
    } else if (now >= entryDate && now <= exitDate) {
      return 'bg-green-100 text-green-800'; // Em andamento
    } else {
      return 'bg-gray-100 text-gray-800'; // Finalizado
    }
  };

  const getStatusText = (appointment: any) => {
    const now = new Date();
    const entryDate = new Date(appointment.dataEntrada);
    const exitDate = new Date(appointment.dataSaida);
    
    if (now < entryDate) {
      return 'Agendado';
    } else if (now >= entryDate && now <= exitDate) {
      return 'Em andamento';
    } else {
      return 'Finalizado';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por convidado ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Convidado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora Saída
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {getGuestName(appointment.guestId)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDateTime(appointment.dataEntrada)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      {formatDateTime(appointment.dataSaida)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment)}`}>
                      {getStatusText(appointment)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(appointment)}
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
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum agendamento encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AppointmentForm
          appointment={editingAppointment}
          onClose={handleCloseModal}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir este agendamento para "${getGuestName(deleteConfirmation.appointment?.guestId || '')}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Agendamento"
        cancelText="Cancelar"
        type="danger"
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default AppointmentManagement;