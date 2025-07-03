import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ResidentFormProps {
  resident?: any;
  residenceId: string;
  onClose: () => void;
}

const ResidentForm: React.FC<ResidentFormProps> = ({ resident, residenceId, onClose }) => {
  const { addResident, updateResident } = useData();
  const [formData, setFormData] = useState({
    nome: resident?.nome || '',
    email: resident?.email || '',
    celular: resident?.celular || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resident) {
      updateResident(resident.id, formData);
    } else {
      addResident({ ...formData, residenceId });
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
        <div className="bg-purple-100 p-3 rounded-full">
          <User className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {resident ? 'Editar Morador' : 'Novo Morador'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Celular *
          </label>
          <input
            type="text"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            {resident ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidentForm;