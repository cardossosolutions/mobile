import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AppointmentFormProps {
  appointment?: any;
  onClose: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, onClose }) => {
  const { addAppointment, updateAppointment, guests } = useData();
  const [formData, setFormData] = useState({
    guestId: appointment?.guestId || '',
    dataEntrada: appointment?.dataEntrada || '',
    dataSaida: appointment?.dataSaida || '',
    observacoes: appointment?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appointment) {
      updateAppointment(appointment.id, formData);
    } else {
      addAppointment(formData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-100 p-3 rounded-full">
          <Calendar className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Convidado *
          </label>
          <select
            name="guestId"
            value={formData.guestId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o convidado</option>
            {guests.map(guest => (
              <option key={guest.id} value={guest.id}>{guest.nome}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Entrada *
            </label>
            <input
              type="datetime-local"
              name="dataEntrada"
              value={formData.dataEntrada}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Saída *
            </label>
            <input
              type="datetime-local"
              name="dataSaida"
              value={formData.dataSaida}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
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
            {appointment ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;