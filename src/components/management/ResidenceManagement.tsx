import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Home, Users } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import Modal from '../common/Modal';
import ResidenceForm from '../forms/ResidenceForm';
import ResidentManagement from './ResidentManagement';

const ResidenceManagement: React.FC = () => {
  const { residences, deleteResidence } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResidence, setEditingResidence] = useState<any>(null);
  const [selectedResidenceId, setSelectedResidenceId] = useState<string | null>(null);

  const filteredResidences = residences.filter(residence =>
    residence.bloco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    residence.apartamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    residence.proprietario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (residence: any) => {
    setEditingResidence(residence);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta residência?')) {
      deleteResidence(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResidence(null);
  };

  const handleManageResidents = (residenceId: string) => {
    setSelectedResidenceId(residenceId);
  };

  if (selectedResidenceId) {
    return (
      <ResidentManagement
        residenceId={selectedResidenceId}
        onBack={() => setSelectedResidenceId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Residências</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Residência</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por bloco, apartamento ou proprietário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Residência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proprietário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResidences.map((residence) => (
                <tr key={residence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <Home className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Bloco {residence.bloco} - Apt {residence.apartamento}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {residence.proprietario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{residence.email}</div>
                    <div className="text-gray-500">{residence.telefone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleManageResidents(residence.id)}
                        className="text-purple-600 hover:text-purple-800 p-1"
                        title="Gerenciar Moradores"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(residence)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(residence.id)}
                        className="text-red-600 hover:text-red-800 p-1"
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

        {filteredResidences.length === 0 && (
          <div className="text-center py-8">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma residência encontrada</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ResidenceForm
          residence={editingResidence}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ResidenceManagement;