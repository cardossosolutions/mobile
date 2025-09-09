import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar, Clock, User, Home,
  Car, Phone, X,
  Search, Eye, Loader2,
  Camera,
} from 'lucide-react';
import CameraModal from '../common/CameraModal';
import { useToast } from '../../contexts/ToastContext';
import {API_CONFIG, apiRequest} from '../../config/api';
import ActionGateView from "./components/ActionGateView.tsx";
import { useData } from '../../contexts/DataContext';
import DatePicker , { registerLocale } from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import {ptBR} from "date-fns/locale";
import { format } from "date-fns";

registerLocale("ptBR", ptBR); // register it with the name you want

// Interface para os dados do visitante baseada na API
interface VisitorDetails {
  id: number;
  visitor_name: string;
  visitor_id: number;
  cpf: string;
  residence: string;
  visitor_mobile: string;
  rg: string | null;
  plate: string | null;
  observation: string;
  dateBegin: string;
  dateEnding: string;
  responsibles: Array<{
    name: string;
    mobile: string;
  }>;
  actions_gate: {
    entrance: Array<{
      "id": number,
      "name": string,
      "action": string,
      "created_at": string
    }>;
    exit: Array<{
      "id": number,
      "name": string,
      "action": string,
      "created_at": string
    }>;
  }
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
              <Home className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Residência: {visitor.residence}</span>
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
              <span className="break-all">{visitor.visitor_mobile}</span>
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

// Função para abrir WhatsApp Web
const openWhatsApp = (phoneNumber: string, visitorName: string, residenceName: string) => {
  // Limpar o número de telefone (remover caracteres especiais)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Adicionar código do país se não tiver (assumindo Brasil +55)
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  // Mensagem padrão
  const message = `Olá! Sou da portaria. O visitante *${visitorName}* está aqui para a residência *${residenceName}*. Posso autorizar a entrada?`;
  
  // Abrir WhatsApp Web
  window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
};

const VisitorDetailsModal: React.FC<{
  visitorData: VisitorDetails | null;
  onClose: () => void 
}> = ({ visitorData, onClose }) => {
  if (!visitorData) return null

  const [actionsGateEntrance, setActionsGateEntrance] = useState([]);
  const [actionsGateExit, setActionsGateExit] = useState([]);

  const [loadingActionEntance, setLoadingActionEntance] = useState(false);
  const [loadingActionExit, setLoadingActionExit] = useState(false);
  const [loadCard,setLoadCard] = useState(true);
  const [visitor,setVisitor] = useState(visitorData);

  const { registerAction } = useData();

  useEffect(() => {

    const fetchVisitorDetails = async () => {
      try {
        const response = await apiRequest(`/visitors/schedule/card/${visitor.id}`, {
          method: 'GET',
        });
        setVisitor(response); // Atualizamos o visitante com os dados da API
        setActionsGateEntrance(response?.actions_gate?.entrance || []);
        setActionsGateExit(response?.actions_gate?.exit || []);
      } catch (error) {
        console.error('Erro ao buscar os detalhes do visitante:', error);
      } finally {
        setLoadCard(false);
      }
    };

    setLoadCard(true);
    fetchVisitorDetails();

  }, []);


  const formatDateRange = (dateBegin: string, dateEnding: string) => {
    if (dateBegin === dateEnding) {
      return dateBegin;
    }
    return `${dateBegin} até ${dateEnding}`;
  };

  const submitRegisterAction = async (register: { event_id: number; action: string; type: string }) => {

    const dataToSubmit = {
      event_id: register.event_id,
      action: register.action,
      type: register.type
    };

    console.log('dataToSubmit', dataToSubmit);

    if(register.action === 'entrance'){
      setLoadingActionEntance(true);
    }else{
      setLoadingActionExit(true);
    }


    const actions = registerAction(dataToSubmit)

    actions
        .then((response) => {

          setActionsGateEntrance(response?.entrance ?? []);
          setActionsGateExit(response?.exit ?? []);
          btnLoading(register.action);
        })
        .catch(() => {
          btnLoading(register.action);
        })
        .finally(() => {
          btnLoading(register.action);
        });

  }


  const btnLoading = (actionLoad: string) => {
    actionLoad === 'entrance'
        ? setLoadingActionEntance(false)
        : setLoadingActionExit(false);
  }

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

        {loadCard ? (
            <div className="h-20 flex items-center justify-center">
              <div className="flex items-center space-x-3 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Carregando detalhes do agendamento...</span>
              </div>
            </div>
        ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Visitor Information and Residents */}
                <div className="space-y-6">
                  {/* Visitor Information */}
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
                          <span className="text-gray-900">{visitor.visitor_mobile}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Residents Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Moradores da Residência</h3>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-full shadow-lg">
                          <Home className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {visitor.residence}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {visitor.responsibles.map((responsible, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-900">{responsible.name}</p>
                                  <p className="text-sm text-gray-600">{responsible.mobile}</p>
                                </div>
                              </div>
                              {responsible.mobile && (
                                  <button
                                      onClick={() => openWhatsApp(responsible.mobile, visitor.visitor_name, visitor.residence)}
                                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex-shrink-0"
                                      title={`Enviar mensagem no WhatsApp para ${responsible.name}`}
                                  >
                                    <img
                                        src="/icone_whastaap.png"
                                        alt="WhatsApp"
                                        className="w-4 h-4"
                                    />
                                  </button>
                              )}
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Appointment Details, Vehicle and Actions */}
                <div className="space-y-6">
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

                  {/* Ações Rápidas */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h4>
                    <div className="space-y-3">
                      <button
                          onClick={() => submitRegisterAction({
                            event_id: visitor.id,
                            action: "entrance",
                            type: "schedule"
                          })}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md"
                          disabled={loadingActionEntance}
                      >
                        {loadingActionEntance ? (
                            <div className="flex justify-center items-center space-x-2">
                              <span>Processando...</span>
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : (
                            'Confirmar Entrada'
                        )}
                      </button>

                      <button
                          onClick={() => submitRegisterAction({
                            event_id: visitor.id,
                            action: "exit",
                            type: "schedule"
                          })}
                          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-md"
                          disabled={loadingActionExit}
                      >

                        {loadingActionExit? (
                            <div className="flex justify-center items-center space-x-2">
                              <span>Processando...</span>
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : (
                            'Registrar Saída'
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {actionsGateEntrance.length > 0 && (
                    <ActionGateView
                        title="Entrada"
                        actions={actionsGateEntrance}
                        isEntrance={true}
                    />
                )}

                {actionsGateExit.length > 0 && (
                    <ActionGateView
                        title="Saída"
                        actions={actionsGateExit}
                        isEntrance={false}
                    />
                )}


              </div>
            </div>
        )}

      </div>
    </div>
  );
};


const VisitorScheduleView: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorDetails | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());


  // Estados para scroll infinito
  const [visitors, setVisitors] = useState<VisitorDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Ref para o elemento sentinela do scroll infinito
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Ref para controlar requisições em andamento
  const loadingRef = useRef(false);
  const lastSearchRef = useRef('');

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if(start && end){
      loadVisitorData(1,searchTerm,true,start,end);
    }
  };

  const dataVisitors = (data:any,reset:any,page:any) => {

    console.log('AQUIIII',reset,page,data)
    if (data && data.data && Array.isArray(data.data)) {
      const newVisitors = data.data;

      if (reset || page === 1) {
        // Primeira página ou reset - substituir todos os dados
        setVisitors(newVisitors);
      } else {
        // Páginas subsequentes - adicionar aos dados existentes, evitando duplicatas
        setVisitors(prev => {
          const existingIds = new Set(prev.map(v => `${v.id}-${v.visitor_id}`));
          const uniqueNewVisitors = newVisitors.filter(v => !existingIds.has(`${v.id}-${v.visitor_id}`));
          return [...prev, ...uniqueNewVisitors];
        });
      }

      setCurrentPage(data.current_page);
      setHasNextPage(data.current_page < data.last_page);
      setTotalCount(data.total);

      console.log(`💾 Visitantes carregados - Página: ${data.current_page}/${data.last_page}, Total: ${data.total}`);
    } else {
      console.warn('⚠️ Resposta do cronograma de visitantes inválida:', data);
      if (reset || page === 1) {
        setVisitors([]);
        setTotalCount(0);
        setHasNextPage(false);
      }
    }

  }

  // Função para carregar dados da API
  const loadVisitorData = useCallback(async (page: number, search?: string, reset: boolean = false,start = startDate,end = endDate) => {
    // Evitar múltiplas requisições simultâneas
    if (loadingRef.current) {
      console.log('⏳ Requisição já em andamento, ignorando...');
      return;
    }

    try {
      setLoading(true);

      loadingRef.current = true;
      console.log(`🔄 Carregando visitantes - Página: ${page}, Busca: ${search || 'N/A'}, Reset: ${reset}`);
      
      if (page === 1 && !reset) {
        setInitialLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      }
      
      // Construir URL com parâmetros de paginação e busca
      let endpoint = `/visitors/schedule?page=${page}`;
      if (search && search.trim()) {
          endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }

      if (start && end) {
          const formattedStartDate = format(start, 'yyyy-MM-dd');
          const formattedEndDate = format(end, 'yyyy-MM-dd');
          endpoint += `&dateBegin=${formattedStartDate}&dateEnding=${formattedEndDate}`;
      }
      
      const data = await apiRequest(endpoint, {
        method: 'GET'
      });
      console.log('✅ Resposta do cronograma de visitantes:', data);

      dataVisitors(data,reset,page)

    } catch (error) {
      console.error('❌ Erro ao carregar cronograma de visitantes:', error);
      
      // Verificar se é erro de conexão com a API
      if (error instanceof Error && error.message === 'Failed to fetch') {
        console.warn('⚠️ Servidor API não está respondendo. Verifique se o servidor está rodando em http://localhost:8080');
        // Não mostrar erro para usuário quando é problema de conexão - deixar interface limpa
      } else {
        console.error('❌ Erro específico:', error);
        // Só mostrar erro se não for problema de conexão
        if (!(error instanceof Error && error.message === 'Failed to fetch')) {
          showError('Erro ao carregar agendamentos', 'Não foi possível carregar os agendamentos. Tente novamente.');
        }
      }
      
      if (reset || page === 1) {
        setVisitors([]);
        setTotalCount(0);
        setHasNextPage(false);
      }
    } finally {
      // SEMPRE executar cleanup no finally
      loadingRef.current = false;
      setInitialLoading(false);
      setLoadingMore(false);
      setLoading(false);
    }
  }, [endDate]);

  // Função para carregar próxima página
  const loadNextPage = useCallback(() => {
    if (!loadingMore && hasNextPage && !loadingRef.current) {
      console.log(`📄 Carregando próxima página: ${currentPage + 1}`);
      loadVisitorData(currentPage + 1, searchTerm,false);
    }
  }, [loadVisitorData, currentPage, searchTerm, loadingMore, hasNextPage]);

  // Configurar Intersection Observer para scroll infinito
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !loadingMore && !initialLoading && !loadingRef.current) {
          console.log('👁️ Sentinela visível - carregando próxima página');
          loadNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, loadingMore, initialLoading, loadNextPage]);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    console.log('👁️ VisitorScheduleView montado - carregando cronograma inicial...');
    loadVisitorData(1, '', true);
  }, []); // Dependências vazias para executar apenas uma vez

  // Debounce para busca
  useEffect(() => {
    // Evitar busca na primeira renderização
    if (lastSearchRef.current === searchTerm) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log(`🔍 Executando busca: "${searchTerm}"`);
      lastSearchRef.current = searchTerm;
      loadVisitorData(1, searchTerm, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadVisitorData]);

  const handlePhotoCapture = async (imageFile: File) => {
    setUploadingPhoto(true);
    
    try {
      console.log('📸 Enviando foto da placa...', imageFile);
      
      // Criar FormData para envio da imagem
      const formData = new FormData();
      formData.append('plate', imageFile);

      // Fazer requisição POST para /visitors/schedule usando apiRequest
      const response = await apiRequest('/visitors/schedule', {
        method: 'POST',
        body: formData,
      },true);

      dataVisitors(response,true,1);

      console.log('RESPOSTAAA',response.data);

      if(response.data.length === 1){
        console.log('ENTROUUUU',response.data[0]);
        setSelectedVisitor(response.data[0])
      }
      
      console.log('✅ Foto enviada com sucesso:', response);
      // showSuccess('Foto enviada!', 'A foto da placa foi enviada com sucesso.');
      
    } catch (error) {
      console.error('❌ Erro ao enviar foto:', error);
      showError('Erro ao enviar foto', 'Não foi possível enviar a foto da placa. Tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // const handleVisitorDatail = async (visitorId :number) => {
  //
  //
  //   try{
  //
  //     const data = await apiRequest('/visitors/schedule/card/'+visitorId, {
  //       method: 'GET'
  //     });
  //
  //     setSelectedVisitor(data);
  //
  //     console.log('CARD',data)
  //
  //   } catch (error) {}
  //
  // }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"><>Agendamentos de Visitantes</></h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todos os agendamentos de forma organizada
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md"
            title="Capturar foto da placa"
          >
            <Camera className="w-5 h-5" />
            <span>Pesquisar Placa</span>
          </button>

          <div>
            <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                rangeSeparator=" - "
                locale="ptBR"
                dateFormat="dd/MM/yyyy"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar visitante, CPF ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[350px]"
            />
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Total de Agendamentos</h3>
            <p className="text-3xl font-bold">{totalCount}</p>
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


      {/* Visitors Grid */}
      {initialLoading || loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3 text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-lg font-medium">Carregando agendamentos...</span>
          </div>
        </div>
      ) : visitors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visitors.map((visitor) => (
              <VisitorCard
                key={`${visitor.id}-${visitor.visitor_id}`}
                visitor={visitor}
                onClick={() => setSelectedVisitor(visitor)}
              />
            ))}
          </div>
          
          {/* Sentinela para scroll infinito */}
          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center space-x-3 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Carregando mais agendamentos...</span>
              </div>
            )}
            {!hasNextPage && visitors.length > 0 && (
              <div className="text-center text-gray-500">
                <p className="text-sm">✨ Todos os agendamentos foram carregados</p>
                <p className="text-xs mt-1">{totalCount} {totalCount === 1 ? 'agendamento' : 'agendamentos'} no total</p>
              </div>
            )}
          </div>
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
       visitorData={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoTaken={handlePhotoCapture}
      />

      {/* Loading overlay para upload */}
      {uploadingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-900">Pesquisando a placa...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorScheduleView;