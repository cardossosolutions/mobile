import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ResidenceFormProps {
  residence?: any;
  onClose: () => void;
}

const ResidenceForm: React.FC<ResidenceFormProps> = ({ residence, onClose }) => {
  const { addResidence, updateResidence } = useData();
  const [formData, setFormData] = useState({
    bloco: residence?.bloco || '',
    apartamento: residence?.apartamento || '',
    proprietario: residence?.proprietario || '',
    telefone: residence?.telefone || '',
    email: residence?.email || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (residence) {
      updateResidence(residence.id, formData);
    } else {
      addResidence(formData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Home className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {residence ? 'Editar Residência' : 'Nova Residência'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bloco *
            </label>
            <input
              type="text"
              name="bloco"
              value={formData.bloco}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apartamento *
            </label>
            <input
              type="text"
              name="apartamento"
              value={formData.apartamento}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proprietário *
          </label>
          <input
            type="text"
            name="proprietario"
            value={formData.proprietario}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {residence ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidenceForm;