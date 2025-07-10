import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiRequest, API_CONFIG } from '../config/api';
import { useToast } from './ToastContext';

interface Company {
  id: string;
  cnpj: string;
  corporate_name: string;
  fantasy_name: string;
  email: string;
  phone_number: string | null;
  mobile_number: string;
  city_name: string | null;
  state: string;
}

interface CompanyResponse {
  current_page: number;
  data: Company[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface Residence {
  id: string;
  name: string;
  street: string;
  number: string;
  active: boolean;
}

interface ResidenceResponse {
  current_page: number;
  data: Residence[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface Resident {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

interface ResidentResponse {
  current_page: number;
  data: Resident[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  permission: string;
  status: string;
}

interface EmployeeResponse {
  current_page: number;
  data: Employee[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface Guest {
  id: string;
  name: string;
  residence: string;
  cpf: string;
  rg: string;
  plate: string | null;
  observation: string;
  type: string;
  description: string;
}

interface GuestResponse {
  current_page: number;
  data: Guest[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface Appointment {
  id: string;
  guestId: string;
  dataEntrada: string;
  dataSaida: string;
  observacoes: string;
}

interface DataContextType {
  companies: Company[];
  companyPagination: CompanyResponse | null;
  residences: Residence[];
  residencePagination: ResidenceResponse | null;
  residents: Resident[];
  residentPagination: ResidentResponse | null;
  employees: Employee[];
  employeePagination: EmployeeResponse | null;
  guests: Guest[];
  guestPagination: GuestResponse | null;
  appointments: Appointment[];
  loadCompanies: (page?: number, search?: string) => Promise<void>;
  loadResidences: (page?: number, search?: string) => Promise<void>;
  loadResidents: (residenceId: string, page?: number, search?: string) => Promise<void>;
  loadEmployees: (page?: number, search?: string) => Promise<void>;
  loadGuests: (page?: number, search?: string) => Promise<void>;
  loadAppointments: () => Promise<void>;
  addCompany: (company: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addResidence: (residence: Omit<Residence, 'id'>) => Promise<void>;
  updateResidence: (id: string, residence: Partial<Residence>) => Promise<void>;
  deleteResidence: (id: string) => Promise<void>;
  addResident: (resident: { residence_id: string; name: string; email: string; mobile: string }) => Promise<void>;
  updateResident: (id: string, resident: { residence_id: string; name: string; email: string; mobile: string }) => Promise<void>;
  deleteResident: (id: string, residenceId: string) => Promise<void>;
  addEmployee: (employee: { name: string; email: string; role: number }) => Promise<{ message: string; password: string }>;
  addEmployee: (employee: { name: string; email: string; role: number; status: number }) => Promise<{ message: string; password: string }>;
  updateEmployee: (id: string, employee: { name: string; email: string; role: number; status: number }) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  resetEmployeePassword: (id: string) => Promise<{ message: string; password: string }>;
  addGuest: (guest: Omit<Guest, 'id'>) => Promise<void>;
  updateGuest: (id: string, guest: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  loadUserProfile: () => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data (mantido como fallback)
const mockCompanies: Company[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    corporate_name: 'Segurança Total Ltda',
    fantasy_name: 'SecTotal',
    email: 'contato@sectotal.com.br',
    phone_number: '(11) 3333-4444',
    mobile_number: '(11) 99999-8888',
    city_name: 'São Paulo',
    state: 'SP'
  },
  {
    id: '2',
    cnpj: '98.765.432/0001-10',
    corporate_name: 'Limpeza Express S.A.',
    fantasy_name: 'CleanExpress',
    email: 'admin@cleanexpress.com.br',
    phone_number: '(11) 2222-3333',
    mobile_number: '(11) 88888-7777',
    city_name: 'São Paulo',
    state: 'SP'
  },
  {
    id: '3',
    cnpj: '11.222.333/0001-44',
    corporate_name: 'Manutenção & Cia Ltda',
    fantasy_name: 'ManutençãoPro',
    email: 'servicos@manutencaopro.com.br',
    phone_number: '(11) 4444-5555',
    mobile_number: '(11) 77777-6666',
    city_name: 'São Paulo',
    state: 'SP'
  }
];

const mockResidences: Residence[] = [
  {
    id: '1',
    name: 'Apartamento 101 - Bloco A',
    street: 'Rua das Flores',
    number: '123',
    active: true
  },
  {
    id: '2',
    name: 'Casa Verde',
    street: 'Avenida Central',
    number: '456',
    active: true
  },
  {
    id: '3',
    name: 'Cobertura Premium',
    street: 'Rua do Sol',
    number: '789',
    active: false
  }
];

const mockResidents: Resident[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    mobile: '11999991111'
  },
  {
    id: '2',
    name: 'Fernanda Silva Santos',
    email: 'fernanda.silva@email.com',
    mobile: '11999991112'
  },
  {
    id: '3',
    name: 'Maria Oliveira Costa',
    email: 'maria.oliveira@email.com',
    mobile: '11888882222'
  },
  {
    id: '4',
    name: 'Carlos Eduardo Ferreira',
    email: 'carlos.ferreira@email.com',
    mobile: '11777773333'
  },
  {
    id: '5',
    name: 'Lucia Ferreira',
    email: 'lucia.ferreira@email.com',
    mobile: '11777773334'
  },
  {
    id: '6',
    name: 'Ana Paula Rodrigues',
    email: 'ana.rodrigues@email.com',
    mobile: '11666664444'
  },
  {
    id: '7',
    name: 'Roberto Lima Souza',
    email: 'roberto.lima@email.com',
    mobile: '11555555555'
  },
  {
    id: '8',
    name: 'Claudia Lima Souza',
    email: 'claudia.lima@email.com',
    mobile: '11555555556'
  }
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Pedro Henrique Silva',
    email: 'pedro.silva@sectotal.com.br',
    permission: 'Administrador',
    status: 'active'
  },
  {
    id: '2',
    name: 'Marcos Antonio Santos',
    email: 'marcos.santos@sectotal.com.br',
    permission: 'Funcionário',
    status: 'active'
  },
  {
    id: '3',
    name: 'Juliana Costa Lima',
    email: 'juliana.lima@cleanexpress.com.br',
    permission: 'Funcionário',
    status: 'active'
  },
  {
    id: '4',
    name: 'Ricardo Pereira',
    email: 'ricardo.pereira@cleanexpress.com.br',
    permission: 'Funcionário',
    status: 'inactive'
  },
  {
    id: '5',
    companyId: '3',
    nome: 'Fernando Alves',
    email: 'fernando.alves@manutencaopro.com.br',
    permissao: 'Administrador',
    status: 'Ativo'
  },
  {
    id: '6',
    companyId: '3',
    nome: 'Luciana Martins',
    email: 'luciana.martins@manutencaopro.com.br',
    permissao: 'Operador',
    status: 'Suspenso'
  }
];

const mockGuests: Guest[] = [
  {
    id: '1',
    name: 'Amanda Cristina Souza',
    residence: 'Apartamento 101 - Bloco A',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    plate: 'ABC-1234',
    observation: 'Visitante frequente, amiga da família Silva',
    type: 'visitor',
    description: 'Amanda Cristina Souza - Cpf: 123.456.789-00 - Placa: ABC-1234'
  },
  {
    id: '2',
    name: 'Bruno Henrique Costa',
    residence: 'Casa Verde',
    cpf: '987.654.321-00',
    rg: '98.765.432-1',
    plate: 'XYZ-9876',
    observation: 'Entregador autorizado',
    type: 'visitor',
    description: 'Bruno Henrique Costa - Cpf: 987.654.321-00 - Placa: XYZ-9876'
  },
  {
    id: '3',
    name: 'Carla Regina Oliveira',
    residence: 'Cobertura Premium',
    cpf: '111.222.333-44',
    rg: '11.222.333-4',
    plate: null,
    observation: 'Professora particular dos filhos',
    type: 'visitor',
    description: 'Carla Regina Oliveira - Cpf: 111.222.333-44 - Placa: '
  },
  {
    id: '4',
    nome: 'Daniel Santos Ferreira',
    rg: '55.666.777-8',
    cpf: '555.666.777-88',
    placaVeiculo: 'DEF-5678',
    observacoes: 'Técnico de manutenção autorizado'
  },
  {
    id: '5',
    nome: 'Eliana Pereira Lima',
    rg: '99.888.777-6',
    cpf: '999.888.777-66',
    placaVeiculo: 'GHI-9012',
    observacoes: 'Cuidadora de idosos'
  },
  {
    id: '6',
    nome: 'Fabio Rodrigues Silva',
    rg: '33.444.555-6',
    cpf: '333.444.555-66',
    placaVeiculo: 'JKL-3456',
    observacoes: 'Primo do proprietário do apt 201'
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    guestId: '1',
    dataEntrada: '2024-01-15T14:00',
    dataSaida: '2024-01-15T18:00',
    observacoes: 'Visita social - aniversário'
  },
  {
    id: '2',
    guestId: '2',
    dataEntrada: '2024-01-16T09:00',
    dataSaida: '2024-01-16T12:00',
    observacoes: 'Entrega de móveis'
  },
  {
    id: '3',
    guestId: '3',
    dataEntrada: '2024-01-17T15:30',
    dataSaida: '2024-01-17T17:30',
    observacoes: 'Aula particular de matemática'
  },
  {
    id: '4',
    guestId: '4',
    dataEntrada: '2024-01-18T08:00',
    dataSaida: '2024-01-18T17:00',
    observacoes: 'Manutenção do ar condicionado'
  },
  {
    id: '5',
    guestId: '5',
    dataEntrada: '2024-01-19T07:00',
    dataSaida: '2024-01-19T19:00',
    observacoes: 'Cuidados com Sr. Roberto'
  },
  {
    id: '6',
    guestId: '6',
    dataEntrada: '2024-01-20T19:00',
    dataSaida: '2024-01-20T23:00',
    observacoes: 'Jantar em família'
  },
  {
    id: '7',
    guestId: '1',
    dataEntrada: '2024-01-22T16:00',
    dataSaida: '2024-01-22T20:00',
    observacoes: 'Reunião de trabalho'
  },
  {
    id: '8',
    guestId: '3',
    dataEntrada: '2024-01-24T14:00',
    dataSaida: '2024-01-24T16:00',
    observacoes: 'Aula de reforço escolar'
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPagination, setCompanyPagination] = useState<CompanyResponse | null>(null);
  const [residences, setResidences] = useState<Residence[]>([]);
  const [residencePagination, setResidencePagination] = useState<ResidenceResponse | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentPagination, setResidentPagination] = useState<ResidentResponse | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeePagination, setEmployeePagination] = useState<EmployeeResponse | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestPagination, setGuestPagination] = useState<GuestResponse | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { showSuccess, showError } = useToast();

  const generateId = () => Date.now().toString();

  // Função específica para carregar dados do usuário
  const loadUserProfile = async () => {
    try {
      console.log('🔄 Fazendo requisição para /user/me...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
        method: 'GET'
      });
      
      console.log('✅ Resposta do /user/me:', response);
      
      // Salvar dados do usuário no localStorage
      if (response) {
        localStorage.setItem('user_profile', JSON.stringify(response));
        console.log('💾 Dados do usuário salvos no localStorage:', response);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao carregar perfil do usuário:', error);
      throw error;
    }
  };

  // Função específica para carregar empresas com paginação
  const loadCompanies = async (page: number = 1, search?: string) => {
    try {
      console.log(`🔄 Carregando empresas - Página: ${page}, Busca: ${search || 'N/A'}`);
      
      // Construir URL com parâmetros de paginação e busca
      let url = `${API_CONFIG.ENDPOINTS.COMPANIES}?page=${page}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(url, {
        method: 'GET'
      });
      
      console.log('✅ Resposta das empresas:', response);
      
      if (response) {
        // Converter os dados da API para o formato esperado
        const companiesData: Company[] = response.data.map((company: any) => ({
          id: company.id.toString(),
          cnpj: company.cnpj,
          corporate_name: company.corporate_name,
          fantasy_name: company.fantasy_name,
          email: company.email,
          phone_number: company.phone_number,
          mobile_number: company.mobile_number,
          city_name: company.city_name,
          state: company.state
        }));
        
        setCompanies(companiesData);
        setCompanyPagination(response);
        console.log('💾 Empresas carregadas:', companiesData);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error);
      // Usar dados mock em caso de erro
      setCompanies(mockCompanies);
      setCompanyPagination(null);
    }
  };

  // Função específica para carregar residências
  const loadResidences = async (page: number = 1, search?: string) => {
    try {
      console.log(`🔄 Carregando residências - Página: ${page}, Parâmetros: ${search || 'N/A'}`);
      
      // Construir URL com parâmetros de paginação e filtros
      let url = `${API_CONFIG.ENDPOINTS.RESIDENCES}?page=${page}`;
      if (search && search.trim()) {
        url += `&${search.trim()}`;
      }
      
      const response = await apiRequest(url, {
        method: 'GET'
      });
      
      console.log('✅ Resposta das residências:', response);
      
      if (response) {
        // Converter os dados da API para o formato esperado
        const residencesData: Residence[] = response.data.map((residence: any) => ({
          id: residence.id.toString(),
          name: residence.name,
          street: residence.street,
          number: residence.number,
          active: residence.active
        }));
        
        setResidences(residencesData);
        setResidencePagination(response);
        console.log('💾 Residências carregadas:', residencesData);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar residências:', error);
      // Usar dados mock em caso de erro
      setResidences(mockResidences);
      setResidencePagination(null);
    }
  };

  // Função específica para carregar moradores
  const loadResidents = async (residenceId: string, page: number = 1, search?: string) => {
    try {
      console.log(`🔄 Carregando moradores da residência ${residenceId} - Página: ${page}, Busca: ${search || 'N/A'}`);
      
      // Construir URL com parâmetros de paginação e busca
      let url = `${API_CONFIG.ENDPOINTS.RESIDENTS}/${residenceId}?page=${page}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(url, {
        method: 'GET'
      });
      
      console.log('✅ Resposta dos moradores:', response);
      
      if (response) {
        // Converter os dados da API para o formato esperado
        const residentsData: Resident[] = response.data.map((resident: any) => ({
          id: resident.id.toString(),
          name: resident.name,
          email: resident.email,
          mobile: resident.mobile
        }));
        
        setResidents(residentsData);
        setResidentPagination(response);
        console.log('💾 Moradores carregados:', residentsData);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar moradores:', error);
      // Usar dados mock em caso de erro
      setResidents(mockResidents);
      setResidentPagination(null);
    }
  };

  // Função específica para carregar funcionários
  const loadEmployees = async (page: number = 1, search?: string) => {
    try {
      console.log(`🔄 Carregando funcionários - Página: ${page}, Busca: ${search || 'N/A'}`);
      
      // Construir URL com parâmetros de paginação e busca
      let url = `${API_CONFIG.ENDPOINTS.EMPLOYEES}?page=${page}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(url, {
        method: 'GET'
      });
      
      console.log('✅ Resposta dos funcionários:', response);
      
      if (response) {
        // Converter os dados da API para o formato esperado
        const employeesData: Employee[] = response.data.map((employee: any) => ({
          id: employee.id.toString(),
          name: employee.name,
          email: employee.email,
          permission: employee.permission,
          status: employee.status
        }));
        
        setEmployees(employeesData);
        setEmployeePagination(response);
        console.log('💾 Funcionários carregados:', employeesData);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários:', error);
      // Usar dados mock em caso de erro
      setEmployees(mockEmployees);
      setEmployeePagination(null);
    }
  };

  // Função específica para carregar convidados
  const loadGuests = async (page: number = 1, search?: string) => {
    try {
      console.log(`🔄 Carregando convidados - Página: ${page}, Busca: ${search || 'N/A'}`);
      
      // Construir URL com parâmetros de paginação e busca
      let url = `${API_CONFIG.ENDPOINTS.GUESTS_LIST}?page=${page}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await apiRequest(url, {
        method: 'GET'
      });
      
      console.log('✅ Resposta dos convidados:', response);
      
      // Verificar se a resposta tem estrutura de paginação
      if (response && response.data && Array.isArray(response.data) && response.current_page !== undefined) {
        // Converter dados da API para o formato esperado
        const guestsData: Guest[] = response.data.map((guest: any) => ({
          id: guest.id.toString(),
          name: guest.name,
          residence: guest.residence,
          cpf: guest.cpf,
          rg: '', // RG não vem na listagem, será preenchido na edição
          plate: guest.plate || null,
          observation: guest.observation || '',
          type: 'visitor',
          description: guest.description
        }));
        
        setGuests(guestsData);
        setGuestPagination(response);
        console.log('💾 Convidados carregados:', guestsData);
      } else {
        console.warn('⚠️ Resposta de convidados inválida:', response);
        setGuests([]);
        setGuestPagination(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar convidados:', error);
      // Usar dados mock em caso de erro
      setGuests(mockGuests);
      setGuestPagination(null);
    }
  };

  // Função específica para carregar agendamentos
  const loadAppointments = async () => {
    try {
      console.log('🔄 Carregando agendamentos...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.APPOINTMENTS, {
        method: 'GET'
      });
      
      console.log('✅ Resposta dos agendamentos:', response);
      
      if (response && response.data) {
        setAppointments(response.data);
      } else if (response) {
        setAppointments(response);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
      // Usar dados mock em caso de erro
      setAppointments(mockAppointments);
    }
  };

  // Funções para empresas
  const addCompany = async (company: Omit<Company, 'id'>) => {
    try {
      console.log('📤 Adicionando empresa...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.COMPANIES, {
        method: 'POST',
        body: JSON.stringify(company)
      });
      
      if (response && response.data) {
        // Recarregar a lista de empresas após adicionar
        await loadCompanies();
        showSuccess('Empresa adicionada!', 'A empresa foi cadastrada com sucesso.');
      } else {
        // Fallback para mock
        setCompanies(prev => [...prev, { ...company, id: generateId() }]);
        showSuccess('Empresa adicionada!', 'A empresa foi cadastrada com sucesso.');
      }
    } catch (error) {
      console.error('Error adding company:', error);
      showError('Erro ao adicionar empresa', 'Não foi possível cadastrar a empresa. Tente novamente.');
      // Fallback para mock
      setCompanies(prev => [...prev, { ...company, id: generateId() }]);
    }
  };

  const updateCompany = async (id: string, company: Partial<Company>) => {
    try {
      console.log('📝 Atualizando empresa...');
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(company)
      });
      
      if (response) {
        // Recarregar a lista de empresas após atualizar
        await loadCompanies();
        showSuccess('Empresa atualizada!', 'Os dados da empresa foram atualizados com sucesso.');
      } else {
        // Fallback para mock
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...company } : c));
        showSuccess('Empresa atualizada!', 'Os dados da empresa foram atualizados com sucesso.');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      showError('Erro ao atualizar empresa', 'Não foi possível atualizar a empresa. Tente novamente.');
      // Fallback para mock
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...company } : c));
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      console.log('🗑️ Excluindo empresa...');
      await apiRequest(`${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`, {
        method: 'DELETE'
      });
      
      // Recarregar a lista de empresas após deletar
      await loadCompanies();
      showSuccess('Empresa excluída!', 'A empresa foi removida com sucesso.');
    } catch (error) {
      console.error('Error deleting company:', error);
      showError('Erro ao excluir empresa', 'Não foi possível excluir a empresa. Tente novamente.');
      // Fallback para mock
      setCompanies(prev => prev.filter(c => c.id !== id));
    }
  };

  // Funções para residências
  const addResidence = async (residence: Omit<Residence, 'id'>) => {
    try {
      console.log('📤 Adicionando residência...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RESIDENCES, {
        method: 'POST',
        body: JSON.stringify(residence)
      });
      
      if (response && response.data) {
        // Recarregar a lista de residências após adicionar
        await loadResidences();
        showSuccess('Residência adicionada!', 'A residência foi cadastrada com sucesso.');
      } else {
        setResidences(prev => [...prev, { ...residence, id: generateId() }]);
        showSuccess('Residência adicionada!', 'A residência foi cadastrada com sucesso.');
      }
    } catch (error) {
      console.error('Error adding residence:', error);
      showError('Erro ao adicionar residência', 'Não foi possível cadastrar a residência. Tente novamente.');
      setResidences(prev => [...prev, { ...residence, id: generateId() }]);
    }
  };

  const updateResidence = async (id: string, residence: Partial<Residence>) => {
    try {
      console.log('📝 Atualizando residência...');
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(residence)
      });
      
      console.log('✅ Residência atualizada:', response);
      
      // Recarregar a lista de residências após atualizar
      await loadResidences();
      showSuccess('Residência atualizada!', 'Os dados da residência foram atualizados com sucesso.');
    } catch (error) {
      console.error('Error updating residence:', error);
      showError('Erro ao atualizar residência', 'Não foi possível atualizar a residência. Tente novamente.');
      // Fallback para mock
      setResidences(prev => prev.map(r => r.id === id ? { ...r, ...residence } : r));
    }
  };

  const deleteResidence = async (id: string) => {
    try {
      console.log('🗑️ Excluindo residência...');
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'DELETE'
      });
      
      setResidences(prev => prev.filter(r => r.id !== id));
      setResidents(prev => prev.filter(r => r.residenceId !== id));
      showSuccess('Residência excluída!', 'A residência foi removida com sucesso.');
    } catch (error) {
      console.error('Error deleting residence:', error);
      showError('Erro ao excluir residência', 'Não foi possível excluir a residência. Tente novamente.');
      setResidences(prev => prev.filter(r => r.id !== id));
      setResidents(prev => prev.filter(r => r.residenceId !== id));
    }
  };

  // Funções para moradores
  const addResident = async (resident: { residence_id: string; name: string; email: string; mobile: string }) => {
    try {
      console.log('📤 Adicionando morador...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RESIDENTS, {
        method: 'POST',
        body: JSON.stringify(resident)
      });
      
      if (response && response.data) {
        // Recarregar a lista de moradores após adicionar
        await loadResidents(resident.residence_id);
        showSuccess('Morador adicionado!', 'O morador foi cadastrado com sucesso.');
      } else {
        // Fallback para mock
        const newResident = {
          id: generateId(),
          name: resident.name,
          email: resident.email,
          mobile: resident.mobile
        };
        setResidents(prev => [...prev, newResident]);
        showSuccess('Morador adicionado!', 'O morador foi cadastrado com sucesso.');
      }
    } catch (error) {
      console.error('Error adding resident:', error);
      showError('Erro ao adicionar morador', 'Não foi possível cadastrar o morador. Tente novamente.');
      // Fallback para mock
      const newResident = {
        id: generateId(),
        name: resident.name,
        email: resident.email,
        mobile: resident.mobile
      };
      setResidents(prev => [...prev, newResident]);
    }
  };

  const updateResident = async (id: string, resident: { residence_id: string; name: string; email: string; mobile: string }) => {
    try {
      console.log('📝 Atualizando morador...');
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          residence_id: Number(resident.residence_id),
          name: resident.name,
          email: resident.email,
          mobile: resident.mobile
        })
      });
      
      if (response) {
        // Recarregar a lista de moradores após atualizar
        await loadResidents(resident.residence_id);
        showSuccess('Morador atualizado!', 'Os dados do morador foram atualizados com sucesso.');
      } else {
        // Fallback para mock
        setResidents(prev => prev.map(r => r.id === id ? { 
          ...r, 
          name: resident.name,
          email: resident.email,
          mobile: resident.mobile
        } : r));
        showSuccess('Morador atualizado!', 'Os dados do morador foram atualizados com sucesso.');
      }
    } catch (error) {
      console.error('Error updating resident:', error);
      showError('Erro ao atualizar morador', 'Não foi possível atualizar o morador. Tente novamente.');
      // Fallback para mock
      setResidents(prev => prev.map(r => r.id === id ? { 
        ...r, 
        name: resident.name,
        email: resident.email,
        mobile: resident.mobile
      } : r));
    }
  };

  const deleteResident = async (id: string, residenceId: string) => {
    try {
      console.log('🗑️ Excluindo morador...');
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENTS}/${id}/${residenceId}`, {
        method: 'DELETE'
      });
      
      setResidents(prev => prev.filter(r => r.id !== id));
      showSuccess('Morador excluído!', 'O morador foi removido com sucesso.');
    } catch (error) {
      console.error('Error deleting resident:', error);
      showError('Erro ao excluir morador', 'Não foi possível excluir o morador. Tente novamente.');
      setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  // Funções para funcionários
  const addEmployee = async (employee: { name: string; email: string; role: number; status: number }): Promise<{ message: string; password: string }> => {
    try {
      console.log('📤 Adicionando funcionário...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEES, {
        method: 'POST',
        body: JSON.stringify(employee)
      });
      
      if (response && response.message) {
        // Recarregar a lista de funcionários após adicionar
        await loadEmployees();
        showSuccess('Funcionário adicionado!', 'O funcionário foi cadastrado com sucesso.');
        return { message: response.message, password: response.password };
      } else {
        // Fallback para mock
        const newEmployee = { 
          ...employee, 
          id: generateId(), 
          permission: employee.role === 2 ? 'Administrador' : 'Funcionário', 
          status: employee.status === 1 ? 'active' : 'inactive' 
        };
        setEmployees(prev => [...prev, newEmployee]);
        showSuccess('Funcionário adicionado!', 'O funcionário foi cadastrado com sucesso.');
        return { message: 'Funcionário cadastrado', password: 'mock123' };
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      showError('Erro ao adicionar funcionário', 'Não foi possível cadastrar o funcionário. Tente novamente.');
      throw error;
    }
  };

  const updateEmployee = async (id: string, employee: { name: string; email: string; role: number; status: number }) => {
    try {
      console.log('📝 Atualizando funcionário...');
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employee)
      });
      
      if (response) {
        // Recarregar a lista de funcionários após atualizar
        await loadEmployees();
        showSuccess('Funcionário atualizado!', 'Os dados do funcionário foram atualizados com sucesso.');
      } else {
        // Fallback para mock
        const updatedEmployee = {
          name: employee.name,
          email: employee.email,
          permission: employee.role === 2 ? 'Administrador' : 'Funcionário',
          status: employee.status === 1 ? 'active' : 'inactive'
        };
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updatedEmployee } : e));
        showSuccess('Funcionário atualizado!', 'Os dados do funcionário foram atualizados com sucesso.');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      showError('Erro ao atualizar funcionário', 'Não foi possível atualizar o funcionário. Tente novamente.');
      // Fallback para mock
      const updatedEmployee = {
        name: employee.name,
        email: employee.email,
        permission: employee.role === 2 ? 'Administrador' : 'Funcionário',
        status: employee.status === 1 ? 'active' : 'inactive'
      };
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updatedEmployee } : e));
    }
  };

  const resetEmployeePassword = async (id: string): Promise<{ message: string; password: string }> => {
    try {
      console.log('🔄 Resetando senha do funcionário...');
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/reset/${id}`, {
        method: 'GET'
      });
      
      console.log('✅ Senha resetada:', response);
      
      if (response && response.message) {
        showSuccess('Senha resetada!', 'A nova senha foi gerada com sucesso.');
        return { message: response.message, password: response.password };
      } else {
        // Fallback para mock
        const mockPassword = 'mock' + Math.random().toString(36).substr(2, 6);
        showSuccess('Senha resetada!', 'A nova senha foi gerada com sucesso.');
        return { message: 'Senha resetada com sucesso', password: mockPassword };
      }
    } catch (error) {
      console.error('Error resetting employee password:', error);
      showError('Erro ao resetar senha', 'Não foi possível resetar a senha. Tente novamente.');
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      console.log('🗑️ Excluindo funcionário...');
      await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'DELETE'
      });
      
      setEmployees(prev => prev.filter(e => e.id !== id));
      showSuccess('Funcionário atualizado!', 'Os dados do funcionário foram atualizados com sucesso.');
    } catch (error) {
      console.error('Error updating employee:', error);
      showError('Erro ao atualizar funcionário', 'Não foi possível atualizar o funcionário. Tente novamente.');
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employee } : e));
    }
  };

  // Funções para convidados
  const addGuest = async (guest: Omit<Guest, 'id'>) => {
    try {
      console.log('📤 Adicionando convidado...');
      
      // Preparar dados para envio conforme API
      const guestData = {
        name: guest.name,
        rg: guest.rg,
        cpf: guest.cpf.replace(/\D/g, ''), // Remover máscara
        placa: guest.plate || '',
        observation: guest.observation,
        type: 'visitor'
      };
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.GUESTS, {
        method: 'POST',
        body: JSON.stringify(guestData)
      });
      
      console.log('✅ Resposta do cadastro:', response);
      
      if (response && response.message) {
        // Recarregar lista após adicionar
        await loadGuests();
        showSuccess('Convidado adicionado!', 'O convidado foi cadastrado com sucesso.');
      } else {
        // Fallback para mock
        const newGuest = { 
          ...guest, 
          id: generateId(),
          description: `${guest.name} - Cpf: ${guest.cpf} - Placa: ${guest.plate || ''}`
        };
        setGuests(prev => [...prev, newGuest]);
        showSuccess('Convidado adicionado!', 'O convidado foi cadastrado com sucesso.');
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      showError('Erro ao adicionar convidado', 'Não foi possível cadastrar o convidado. Tente novamente.');
      // Fallback para mock
      const newGuest = { 
        ...guest, 
        id: generateId(),
        description: `${guest.name} - Cpf: ${guest.cpf} - Placa: ${guest.plate || ''}`
      };
      setGuests(prev => [...prev, newGuest]);
    }
  };

  const updateGuest = async (id: string, guest: Partial<Guest>) => {
    try {
      console.log('📝 Atualizando convidado...');
      
      // Preparar dados para envio conforme API
      const guestData = {
        name: guest.name,
        rg: guest.rg,
        cpf: guest.cpf?.replace(/\D/g, ''), // Remover máscara
        placa: guest.plate || '',
        observation: guest.observation,
        type: 'visitor'
      };
      
      await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guestData)
      });
      
      console.log('✅ Convidado atualizado');
      
      // Recarregar lista após atualizar
      await loadGuests();
      showSuccess('Convidado atualizado!', 'Os dados do convidado foram atualizados com sucesso.');
    } catch (error) {
      console.error('Error updating guest:', error);
      showError('Erro ao atualizar convidado', 'Não foi possível atualizar o convidado. Tente novamente.');
      // Fallback para mock
      setGuests(prev => prev.map(g => g.id === id ? { ...g, ...guest } : g));
    }
  };

  const deleteGuest = async (id: string) => {
    try {
      console.log('🗑️ Excluindo convidado...');
      await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'DELETE'
      });
      
      setGuests(prev => prev.filter(g => g.id !== id));
      setAppointments(prev => prev.filter(a => a.guestId !== id));
      showSuccess('Convidado excluído!', 'O convidado foi removido com sucesso.');
    } catch (error) {
      console.error('Error deleting guest:', error);
      showError('Erro ao excluir convidado', 'Não foi possível excluir o convidado. Tente novamente.');
      setGuests(prev => prev.filter(g => g.id !== id));
      setAppointments(prev => prev.filter(a => a.guestId !== id));
    }
  };

  // Funções para agendamentos
  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      console.log('📤 Adicionando agendamento...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.APPOINTMENTS, {
        method: 'POST',
        body: JSON.stringify(appointment)
      });
      
      if (response && response.data) {
        setAppointments(prev => [...prev, response.data]);
        showSuccess('Agendamento criado!', 'O agendamento foi criado com sucesso.');
      } else {
        setAppointments(prev => [...prev, { ...appointment, id: generateId() }]);
        showSuccess('Agendamento criado!', 'O agendamento foi criado com sucesso.');
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      showError('Erro ao criar agendamento', 'Não foi possível criar o agendamento. Tente novamente.');
      setAppointments(prev => [...prev, { ...appointment, id: generateId() }]);
    }
  };

  const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
    try {
      console.log('📝 Atualizando agendamento...');
      await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointment)
      });
      
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointment } : a));
      showSuccess('Agendamento atualizado!', 'O agendamento foi atualizado com sucesso.');
    } catch (error) {
      console.error('Error updating appointment:', error);
      showError('Erro ao atualizar agendamento', 'Não foi possível atualizar o agendamento. Tente novamente.');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointment } : a));
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      console.log('🗑️ Excluindo agendamento...');
      await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, {
        method: 'DELETE'
      });
      
      setAppointments(prev => prev.filter(a => a.id !== id));
      showSuccess('Agendamento excluído!', 'O agendamento foi removido com sucesso.');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showError('Erro ao excluir agendamento', 'Não foi possível excluir o agendamento. Tente novamente.');
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <DataContext.Provider value={{
      companies,
      companyPagination,
      residences,
      residencePagination,
      residents,
      residentPagination,
      employees,
      employeePagination,
      guests,
      guestPagination,
      appointments,
      loadCompanies,
      loadResidences,
      loadResidents,
      loadEmployees,
      loadGuests,
      loadAppointments,
      addCompany,
      updateCompany,
      deleteCompany,
      addResidence,
      updateResidence,
      deleteResidence,
      addResident,
      updateResident,
      deleteResident,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      resetEmployeePassword,
      addGuest,
      updateGuest,
      deleteGuest,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      loadUserProfile
    }}>
      {children}
    </DataContext.Provider>
  );
};