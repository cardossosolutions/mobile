import React, { useState } from 'react';
import { Calendar, Clock, User, Home, Car, Phone, Mail, MapPin, X, Filter, Search, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface VisitorDetails {
  id: string;
  name: string;
  document: string;
  phone: string;
  licensePlate?: string;
  residence: {
    block: string;
    apartment: string;
    owner: string;
    phone: string;
  };
  appointment: {
    entryTime: string;
    exitTime: string;
    status: 'scheduled';
    notes?: string;
  };
}

const LicensePlate: React.FC<{ plate: string }> = ({ plate }) => {
  const formatPlate = (plate: string) => {
    // Format for Mercosul pattern: ABC1D23
    if (plate.length === 7) {
      return `${plate.slice(0, 3)}${plate.slice(3, 4)}${plate.slice(4, 5)}${plate.slice(5, 7)}`;
    }
    return plate;
  };

  const formattedPlate = formatPlate(plate);

  return (
    <div className="bg-white border-4 border-blue-600 rounded-lg p-3 shadow-lg">
      <div className="text-center">
        <div className="text-xs font-bold text-blue-600 mb-1">BRASIL</div>
        <div className="text-2xl font-bold text-gray-900 tracking-wider font-mono">
          {formattedPlate}
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="w-6 h-4 bg-blue-600 rounded"></div>
          <div className="text-xs text-gray-600">MERCOSUL</div>
          <div className="w-6 h-4 bg-green-500 rounded"></div>
        </div>
      </div>
    </div>
  );
};

const VisitorCard: React.FC<{ visitor: VisitorDetails; onClick: () => void }> = ({ visitor, onClick }) => {
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-300 transform hover:scale-[1.02] h-full"
      onClick={onClick}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Status Badge - Topo */}
        <div className="flex justify-end mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-4 h-4 mr-1" />
            Agendado
          </span>
        </div>

        {/* Header - Ícone, Nome e CPF alinhados */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full shadow-lg flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">{visitor.name}</h3>
            <p className="text-sm text-gray-500 mt-1">CPF: {visitor.document}</p>
          </div>
        </div>

        {/* Content - Flex grow para ocupar espaço disponível */}
        <div className="space-y-3 flex-grow">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
              <Home className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Bloco {visitor.residence.block} - Apt {visitor.residence.apartment}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-orange-100 p-1.5 rounded-full flex-shrink-0">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <span>
              {formatTime(visitor.appointment.entryTime)} às {formatTime(visitor.appointment.exitTime)}
            </span>
          </div>

          {visitor.licensePlate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="bg-purple-100 p-1.5 rounded-full flex-shrink-0">
                <Car className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-mono font-medium">{visitor.licensePlate}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-gray-100 p-1.5 rounded-full flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="break-words">{visitor.residence.owner}</span>
          </div>

          {visitor.appointment.notes && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700 line-clamp-2">{visitor.appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Footer - Sempre no final */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="break-all">{visitor.phone}</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600 flex-shrink-0">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Ver detalhes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VisitorDetailsModal: React.FC<{ 
  visitor: VisitorDetails | null; 
  onClose: () => void 
}> = ({ visitor, onClose }) => {
  if (!visitor) return null;

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end items-center p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visitor Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações do Visitante</h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{visitor.name}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        Agendamento Confirmado
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <span className="font-medium text-gray-700">CPF:</span>
                      <span className="text-gray-900 font-mono">{visitor.document}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{visitor.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Agendamento</h3>
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="font-medium text-gray-700">Entrada:</span>
                      <p className="text-gray-900">{formatDateTime(visitor.appointment.entryTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Clock className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="font-medium text-gray-700">Saída:</span>
                      <p className="text-gray-900">{formatDateTime(visitor.appointment.exitTime)}</p>
                    </div>
                  </div>

                  {visitor.appointment.notes && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-700">Observações:</span>
                      <p className="text-gray-900 mt-2">{visitor.appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Residence and Vehicle Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Residência de Destino</h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-full shadow-lg">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        Bloco {visitor.residence.block} - Apartamento {visitor.residence.apartment}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Proprietário:</span>
                        <p className="text-gray-900">{visitor.residence.owner}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Telefone:</span>
                        <p className="text-gray-900">{visitor.residence.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {visitor.licensePlate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center justify-center mb-4">
                      <LicensePlate plate={visitor.licensePlate} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Placa do veículo registrada</p>
                      <p className="text-xs text-gray-500 mt-1">Padrão Mercosul</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h4>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md">
                    Confirmar Entrada
                  </button>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md">
                    Editar Agendamento
                  </button>
                  <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md">
                    Cancelar Agendamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VisitorScheduleView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetails | null>(null);

  // Dados mockados com foco apenas em agendamentos
  const mockVisitorData: VisitorDetails[] = [
    {
      id: '1',
      name: 'Amanda Cristina Souza',
      document: '123.456.789-00',
      phone: '(11) 99999-1234',
      licensePlate: 'ABC1D23',
      residence: {
        block: 'A',
        apartment: '101',
        owner: 'João Silva Santos',
        phone: '(11) 99999-1111'
      },
      appointment: {
        entryTime: `${selectedDate}T14:00`,
        exitTime: `${selectedDate}T18:00`,
        status: 'scheduled',
        notes: 'Visita social - aniversário da família'
      }
    },
    {
      id: '2',
      name: 'Bruno Henrique Costa',
      document: '987.654.321-00',
      phone: '(11) 88888-5678',
      licensePlate: 'XYZ9A87',
      residence: {
        block: 'B',
        apartment: '202',
        owner: 'Ana Paula Rodrigues',
        phone: '(11) 66666-4444'
      },
      appointment: {
        entryTime: `${selectedDate}T09:00`,
        exitTime: `${selectedDate}T12:00`,
        status: 'scheduled',
        notes: 'Entrega de móveis novos para o apartamento'
      }
    },
    {
      id: '3',
      name: 'Carla Regina Oliveira',
      document: '111.222.333-44',
      phone: '(11) 77777-9012',
      residence: {
        block: 'C',
        apartment: '301',
        owner: 'Roberto Lima Souza',
        phone: '(11) 55555-5555'
      },
      appointment: {
        entryTime: `${selectedDate}T15:30`,
        exitTime: `${selectedDate}T17:30`,
        status: 'scheduled',
        notes: 'Aula particular de matemática para os filhos'
      }
    },
    {
      id: '4',
      name: 'Daniel Santos Ferreira',
      document: '555.666.777-88',
      phone: '(11) 44444-3456',
      licensePlate: 'DEF5G78',
      residence: {
        block: 'A',
        apartment: '102',
        owner: 'Maria Oliveira Costa',
        phone: '(11) 88888-2222'
      },
      appointment: {
        entryTime: `${selectedDate}T08:00`,
        exitTime: `${selectedDate}T17:00`,
        status: 'scheduled',
        notes: 'Manutenção preventiva do ar condicionado'
      }
    },
    {
      id: '5',
      name: 'Eliana Pereira Lima',
      document: '999.888.777-66',
      phone: '(11) 33333-7890',
      licensePlate: 'GHI9J01',
      residence: {
        block: 'B',
        apartment: '201',
        owner: 'Carlos Eduardo Ferreira',
        phone: '(11) 77777-3333'
      },
      appointment: {
        entryTime: `${selectedDate}T07:00`,
        exitTime: `${selectedDate}T19:00`,
        status: 'scheduled',
        notes: 'Cuidadora - acompanhamento do Sr. Roberto'
      }
    },
    {
      id: '6',
      name: 'Fabio Rodrigues Silva',
      document: '333.444.555-66',
      phone: '(11) 22222-4567',
      licensePlate: 'JKL3M45',
      residence: {
        block: 'C',
        apartment: '302',
        owner: 'Patricia Santos',
        phone: '(11) 11111-8888'
      },
      appointment: {
        entryTime: `${selectedDate}T19:00`,
        exitTime: `${selectedDate}T23:00`,
        status: 'scheduled',
        notes: 'Jantar em família - primo da proprietária'
      }
    },
    {
      id: '7',
      name: 'Marcos Antonio Silva',
      document: '444.555.666-77',
      phone: '(11) 99999-8888',
      licensePlate: 'MNO6P78',
      residence: {
        block: 'A',
        apartment: '103',
        owner: 'Sandra Oliveira',
        phone: '(11) 77777-9999'
      },
      appointment: {
        entryTime: `${selectedDate}T16:00`,
        exitTime: `${selectedDate}T20:00`,
        status: 'scheduled',
        notes: 'Reunião de trabalho - consultor financeiro'
      }
    },
    {
      id: '8',
      name: 'Juliana Costa Lima',
      document: '777.888.999-00',
      phone: '(11) 66666-5555',
      residence: {
        block: 'B',
        apartment: '203',
        owner: 'Fernando Alves',
        phone: '(11) 44444-3333'
      },
      appointment: {
        entryTime: `${selectedDate}T13:00`,
        exitTime: `${selectedDate}T15:00`,
        status: 'scheduled',
        notes: 'Fisioterapeuta - sessão de reabilitação'
      }
    },
    {
      id: '9',
      name: 'Ricardo Pereira Santos',
      document: '888.999.000-11',
      phone: '(11) 55555-4444',
      licensePlate: 'PQR7S89',
      residence: {
        block: 'A',
        apartment: '104',
        owner: 'Lucia Fernandes',
        phone: '(11) 33333-2222'
      },
      appointment: {
        entryTime: `${selectedDate}T10:30`,
        exitTime: `${selectedDate}T12:30`,
        status: 'scheduled',
        notes: 'Técnico em informática - instalação de internet'
      }
    },
    {
      id: '10',
      name: 'Camila Rodrigues Lima',
      document: '222.333.444-55',
      phone: '(11) 44444-1111',
      residence: {
        block: 'C',
        apartment: '303',
        owner: 'José Carlos Mendes',
        phone: '(11) 22222-9999'
      },
      appointment: {
        entryTime: `${selectedDate}T11:00`,
        exitTime: `${selectedDate}T14:00`,
        status: 'scheduled',
        notes: 'Personal trainer - treino em casa'
      }
    }
  ];

  const filteredVisitors = mockVisitorData.filter(visitor => {
    const matchesDate = visitor.appointment.entryTime.includes(selectedDate);
    const matchesSearch = !searchTerm || 
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.residence.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.residence.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.residence.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesSearch;
  });

  // Ordenar por horário de entrada
  const sortedVisitors = filteredVisitors.sort((a, b) => 
    new Date(a.appointment.entryTime).getTime() - new Date(b.appointment.entryTime).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos de Visitantes</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os agendamentos do dia de forma organizada
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar visitante, apartamento ou proprietário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[300px]"
            />
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Total de Agendamentos</h3>
            <p className="text-3xl font-bold">{sortedVisitors.length}</p>
            <p className="text-sm opacity-75 mt-1">
              {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-full">
            <Calendar className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Visitors Grid */}
      {sortedVisitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedVisitors.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              onClick={() => setSelectedVisitor(visitor)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {selectedDate !== new Date().toISOString().split('T')[0] 
              ? 'Não há agendamentos para a data selecionada. Tente escolher outra data.'
              : 'Não há agendamentos para hoje. Que tal verificar outros dias?'}
          </p>
        </div>
      )}

      {/* Visitor Details Modal */}
      <VisitorDetailsModal
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />
    </div>
  );
};

export default VisitorScheduleView;