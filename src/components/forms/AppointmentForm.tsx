import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AppointmentFormProps {
  appointment?: any;
  onClose: () => void;
}

interface FormErrors {
  guestId?: string;
  dataEntrada?: string;
  dataSaida?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, onClose }) => {
  const { addAppointment, updateAppointment, guests } = useData();
  const [formData, setFormData] = useState({
    guestId: appointment?.guestId || '',
    dataEntrada: appointment?.dataEntrada || '',
    dataSaida: appointment?.dataSaida || '',
    observacoes: appointment?.observacoes || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.guestId) {
      newErrors.guestId = 'Convidado é obrigatório';
    }

    if (!formData.dataEntrada) {
      newErrors.dataEntrada = 'Data e hora de entrada é obrigatória';
    }

    if (!formData.dataSaida) {
      newErrors.dataSaida = 'Data e hora de saída é obrigatória';
    }

    if (formData.dataEntrada && formData.dataSaida) {
      const entryDate = new Date(formData.dataEntrada);
      const exitDate = new Date(formData.dataSaida);
      
      if (exitDate <= entryDate) {
        newErrors.dataSaida = 'Data de saída deve ser posterior à entrada';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (appointment) {
      updateAppointment(appointment.id, formData);
    } else {
      addAppointment(formData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
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
            Convidado <span className="text-red-500">*</span>
          </label>
          <select
            name="guestId"
            value={formData.guestId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.guestId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione o convidado</option>
            {guests.map(guest => (
              <option key={guest.id} value={guest.id}>{guest.nome}</option>
            ))}
          </select>
          {errors.guestId && (
            <p className="text-red-500 text-sm mt-1">{errors.guestId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Entrada <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="dataEntrada"
              value={formData.dataEntrada}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dataEntrada ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dataEntrada && (
              <p className="text-red-500 text-sm mt-1">{errors.dataEntrada}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Saída <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="dataSaida"
              value={formData.dataSaida}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dataSaida ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dataSaida && (
              <p className="text-red-500 text-sm mt-1">{errors.dataSaida}</p>
            )}
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