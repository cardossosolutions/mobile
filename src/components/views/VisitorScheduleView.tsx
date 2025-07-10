import React, { useState } from 'react';
import { Calendar, Clock, User, Home, Car, Phone, Mail, MapPin, X, Filter, Search, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useEffect } from 'react';

// Interface para os dados do visitante baseada na API
interface VisitorDetails {
  id: number;
  visitor_name: string;
  visitor_id: number;
  cpf: string;
  mobile: string;
  rg: string | null;
  plate: string | null;
  observation: string;
  responsible: string;
  dateBegin: string;
  dateEnding: string;
}

const LicensePlate: React.FC<{ plate: string }> = ({ plate }) => {
  const formatPlate = (plate: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Format for Mercosul pattern: ABC1D23
    if (cleanPlate.length === 7) {
      return `${cleanPlate.slice(0, 3)}${cleanPlate.slice(3, 4)}${cleanPlate.slice(4, 5)}${cleanPlate.slice(5, 7)}`;
    }
    return cleanPlate;
  };

  const formattedPlate = formatPlate(plate);

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '280px', height: '140px' }}>
      {/* Header azul com BRASIL */}
      <div className="bg-blue-600 text-white text-center py-2">
        <div className="text-lg font-bold tracking-wider">BRASIL</div>
      </div>

      {/* Área principal da placa */}
      <div className="bg-white flex-1 flex flex-col justify-center items-center py-4">
        {/* Placa */}
        <div className="text-4xl font-bold text-gray-900 tracking-wider font-mono mb-2">
          {formattedPlate}
        </div>
        
        {/* Footer com BR e MERCOSUL */}
        <div className="flex items-center justify-between w-full px-6">
          <div className="text-lg font-bold text-gray-700">BR</div>
          <div className="text-sm text-gray-600 font-medium">MERCOSUL</div>
          <div className="w-6 h-4 bg-blue-600 rounded"></div>
        </div>
      </div>

      {/* Borda preta */}
      <div className="absolute inset-0 border-4 border-black rounded-lg pointer-events-none"></div>
    </div>
  );
};

const VisitorCard: React.FC<{ visitor: VisitorDetails; onClick: () => void }> = ({ visitor, onClick }) => {
  const formatDateRange = (dateBegin: string, dateEnding: string) => {
    if (dateBegin === dateEnding) {
      return dateBegin;
    }
    return `${dateBegin} até ${dateEnding}`;
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
            <h3 className="text-lg font-semibold text-gray-900 leading-tight break-words">{visitor.visitor_name}</h3>
            <p className="text-sm text-gray-500 mt-1">CPF: {visitor.cpf}</p>
          </div>
        </div>

        {/* Content - Flex grow para ocupar espaço disponível */}
        <div className="space-y-3 flex-grow">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Responsável: {visitor.responsible}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="bg-orange-100 p-1.5 rounded-full flex-shrink-0">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <span>
              {formatDateRange(visitor.dateBegin, visitor.dateEnding)}
            </span>
          </div>

          {visitor.plate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="bg-purple-100 p-1.5 rounded-full flex-shrink-0">
                <Car className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-mono font-medium">{visitor.plate}</span>
            </div>
          )}

          {visitor.observation && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700 line-clamp-2">{visitor.observation}</p>
            </div>
          )}
        </div>

        {/* Footer - Sempre no final */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="break-all">{visitor.mobile}</span>
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

  const formatDateRange = (dateBegin: string, dateEnding: string) => {
    if (dateBegin === dateEnding) {
      return dateBegin;
    }
    return `${dateBegin} até ${dateEnding}`;
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
                      <h3 className="text-xl font-semibold text-gray-900">{visitor.visitor_name}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        Agendamento Confirmado
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <span className="font-medium text-gray-700">CPF:</span>
                      <span className="text-gray-900 font-mono">{visitor.cpf}</span>
                    </div>
                    
                    {visitor.rg && (
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">RG:</span>
                        <span className="text-gray-900 font-mono">{visitor.rg}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{visitor.mobile}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Agendamento</h3>
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-medium text-gray-700">Período da Estadia:</span>
                      <p className="text-gray-900">Início: {visitor.dateBegin}</p>
                      <p className="text-gray-900">Fim: {visitor.dateEnding}</p>
                    </div>
                  </div>

                  {visitor.observation && (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-700">Observações:</span>
                      <p className="text-gray-900 mt-2">{visitor.observation}</p>
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
                        Residência do Responsável
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Proprietário:</span>
                        <p className="text-gray-900">{visitor.responsible}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Telefone:</span>
                        <p className="text-gray-900">{visitor.mobile}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {visitor.plate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center justify-center mb-4">
                      <LicensePlate plate={visitor.plate} />
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
  const { visitorSchedule, visitorSchedulePagination, loadVisitorSchedule } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetails | null>(null);

  // Carregar cronograma quando o componente for montado
  useEffect(() => {
    console.log('👁️ VisitorScheduleView montado - carregando cronograma...');
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        await loadVisitorSchedule();
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        handleSearch();
      } else {
        loadVisitorSchedule(1); // Recarregar primeira página sem busca
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadVisitorSchedule(1, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setLoading(true);
    try {
      await loadVisitorSchedule(page, searchTerm);
    } finally {
      setLoading(false);
    }
  };

  // Função para renderizar os botões de paginação
  const renderPaginationButtons = () => {
    if (!visitorSchedulePagination || visitorSchedulePagination.last_page <= 1) {
      return null;
    }

    const buttons = [];
    const currentPage = visitorSchedulePagination.current_page;
    const lastPage = visitorSchedulePagination.last_page;

    // Botão "Anterior"
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );

    // Botões de páginas (simplificado para economizar espaço)
    for (let page = Math.max(1, currentPage - 1); page <= Math.min(lastPage, currentPage + 1); page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          disabled={loading}
          className={`px-3 py-2 text-sm font-medium border border-gray-300 disabled:opacity-50 ${
            page === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-500 bg-white hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      );
    }

    // Botão "Próximo"
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === lastPage || loading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );

    return buttons;
  };

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar visitante, CPF ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[300px]"
            />
          </div>
          
          {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Carregando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Total de Agendamentos</h3>
            <p className="text-3xl font-bold">{visitorSchedulePagination?.total || visitorSchedule.length}</p>
            <p className="text-sm opacity-75 mt-1">
              {new Date().toLocaleDateString('pt-BR', { 
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

      {/* Informações de paginação */}
      {visitorSchedulePagination && (
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm">
          <div>
            Mostrando {visitorSchedulePagination.from} a {visitorSchedulePagination.to} de {visitorSchedulePagination.total} agendamentos
          </div>
          <div>
            Página {visitorSchedulePagination.current_page} de {visitorSchedulePagination.last_page}
          </div>
        </div>
      )}

      {/* Visitors Grid */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3 text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-lg font-medium">Carregando agendamentos...</span>
          </div>
        </div>
      ) : visitorSchedule.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visitorSchedule.map((visitor) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                onClick={() => setSelectedVisitor(visitor)}
              />
            ))}
          </div>
          
          {/* Controles de paginação */}
          {visitorSchedulePagination && visitorSchedulePagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                {visitorSchedulePagination.total} {visitorSchedulePagination.total === 1 ? 'agendamento' : 'agendamentos'} no total
              </div>
              <div className="flex items-center space-x-1">
                {renderPaginationButtons()}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm 
              ? 'Não há agendamentos para a busca realizada. Tente outros termos.'
              : 'Não há agendamentos cadastrados no momento.'}
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