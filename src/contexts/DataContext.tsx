import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiRequest, API_CONFIG } from '../config/api';

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
  residenceId: string;
  nome: string;
  email: string;
  celular: string;
}

interface Employee {
  id: string;
  companyId: string;
  nome: string;
  email: string;
  permissao: string;
  status: string;
}

interface Guest {
  id: string;
  nome: string;
  rg: string;
  cpf: string;
  placaVeiculo: string;
  observacoes: string;
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
  employees: Employee[];
  guests: Guest[];
  appointments: Appointment[];
  loadCompanies: (page?: number, search?: string) => Promise<void>;
  loadResidences: (page?: number, search?: string) => Promise<void>;
  loadResidents: () => Promise<void>;
  loadEmployees: () => Promise<void>;
  loadGuests: () => Promise<void>;
  loadAppointments: () => Promise<void>;
  addCompany: (company: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addResidence: (residence: Omit<Residence, 'id'>) => Promise<void>;
  updateResidence: (id: string, residence: Partial<Residence>) => Promise<void>;
  deleteResidence: (id: string) => Promise<void>;
  addResident: (resident: Omit<Resident, 'id'>) => Promise<void>;
  updateResident: (id: string, resident: Partial<Resident>) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
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
    number: '123'
  },
  {
    id: '2',
    name: 'Casa Verde',
    street: 'Avenida Central',
    number: '456'
  },
  {
    id: '3',
    name: 'Cobertura Premium',
    street: 'Rua do Sol',
    number: '789'
  }
];

const mockResidents: Resident[] = [
  {
    id: '1',
    residenceId: '1',
    nome: 'João Silva Santos',
    email: 'joao.silva@email.com',
    celular: '(11) 99999-1111'
  },
  {
    id: '2',
    residenceId: '1',
    nome: 'Fernanda Silva Santos',
    email: 'fernanda.silva@email.com',
    celular: '(11) 99999-1112'
  },
  {
    id: '3',
    residenceId: '2',
    nome: 'Maria Oliveira Costa',
    email: 'maria.oliveira@email.com',
    celular: '(11) 88888-2222'
  },
  {
    id: '4',
    residenceId: '3',
    nome: 'Carlos Eduardo Ferreira',
    email: 'carlos.ferreira@email.com',
    celular: '(11) 77777-3333'
  },
  {
    id: '5',
    residenceId: '3',
    nome: 'Lucia Ferreira',
    email: 'lucia.ferreira@email.com',
    celular: '(11) 77777-3334'
  },
  {
    id: '6',
    residenceId: '4',
    nome: 'Ana Paula Rodrigues',
    email: 'ana.rodrigues@email.com',
    celular: '(11) 66666-4444'
  },
  {
    id: '7',
    residenceId: '5',
    nome: 'Roberto Lima Souza',
    email: 'roberto.lima@email.com',
    celular: '(11) 55555-5555'
  },
  {
    id: '8',
    residenceId: '5',
    nome: 'Claudia Lima Souza',
    email: 'claudia.lima@email.com',
    celular: '(11) 55555-5556'
  }
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    companyId: '1',
    nome: 'Pedro Henrique Silva',
    email: 'pedro.silva@sectotal.com.br',
    permissao: 'Administrador',
    status: 'Ativo'
  },
  {
    id: '2',
    companyId: '1',
    nome: 'Marcos Antonio Santos',
    email: 'marcos.santos@sectotal.com.br',
    permissao: 'Operador',
    status: 'Ativo'
  },
  {
    id: '3',
    companyId: '2',
    nome: 'Juliana Costa Lima',
    email: 'juliana.lima@cleanexpress.com.br',
    permissao: 'Operador',
    status: 'Ativo'
  },
  {
    id: '4',
    companyId: '2',
    nome: 'Ricardo Pereira',
    email: 'ricardo.pereira@cleanexpress.com.br',
    permissao: 'Visitante',
    status: 'Inativo'
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
    nome: 'Amanda Cristina Souza',
    rg: '12.345.678-9',
    cpf: '123.456.789-00',
    placaVeiculo: 'ABC-1234',
    observacoes: 'Visitante frequente, amiga da família Silva'
  },
  {
    id: '2',
    nome: 'Bruno Henrique Costa',
    rg: '98.765.432-1',
    cpf: '987.654.321-00',
    placaVeiculo: 'XYZ-9876',
    observacoes: 'Entregador autorizado'
  },
  {
    id: '3',
    nome: 'Carla Regina Oliveira',
    rg: '11.222.333-4',
    cpf: '111.222.333-44',
    placaVeiculo: '',
    observacoes: 'Professora particular dos filhos'
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

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
          number: residence.number
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
  const loadResidents = async () => {
    try {
      console.log('🔄 Carregando moradores...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RESIDENTS, {
        method: 'GET'
      });
      
      console.log('✅ Resposta dos moradores:', response);
      
      if (response && response.data) {
        setResidents(response.data);
      } else if (response) {
        setResidents(response);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar moradores:', error);
      // Usar dados mock em caso de erro
      setResidents(mockResidents);
    }
  };

  // Função específica para carregar funcionários
  const loadEmployees = async () => {
    try {
      console.log('🔄 Carregando funcionários...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEES, {
        method: 'GET'
      });
      
      console.log('✅ Resposta dos funcionários:', response);
      
      if (response && response.data) {
        setEmployees(response.data);
      } else if (response) {
        setEmployees(response);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários:', error);
      // Usar dados mock em caso de erro
      setEmployees(mockEmployees);
    }
  };

  // Função específica para carregar convidados
  const loadGuests = async () => {
    try {
      console.log('🔄 Carregando convidados...');
      const response = await apiRequest(API_CONFIG.ENDPOINTS.GUESTS, {
        method: 'GET'
      });
      
      console.log('✅ Resposta dos convidados:', response);
      
      if (response && response.data) {
        setGuests(response.data);
      } else if (response) {
        setGuests(response);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar convidados:', error);
      // Usar dados mock em caso de erro
      setGuests(mockGuests);
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
      const response = await apiRequest(API_CONFIG.ENDPOINTS.COMPANIES, {
        method: 'POST',
        body: JSON.stringify(company)
      });
      
      if (response && response.data) {
        // Recarregar a lista de empresas após adicionar
        await loadCompanies();
      } else {
        // Fallback para mock
        setCompanies(prev => [...prev, { ...company, id: generateId() }]);
      }
    } catch (error) {
      console.error('Error adding company:', error);
      // Fallback para mock
      setCompanies(prev => [...prev, { ...company, id: generateId() }]);
    }
  };

  const updateCompany = async (id: string, company: Partial<Company>) => {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(company)
      });
      
      if (response) {
        // Recarregar a lista de empresas após atualizar
        await loadCompanies();
      }
    } catch (error) {
      console.error('Error updating company:', error);
      // Fallback para mock
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...company } : c));
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.COMPANIES}/${id}`, {
        method: 'DELETE'
      });
      
      // Recarregar a lista de empresas após deletar
      await loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      // Fallback para mock
      setCompanies(prev => prev.filter(c => c.id !== id));
    }
  };

  // Funções para residências
  const addResidence = async (residence: Omit<Residence, 'id'>) => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RESIDENCES, {
        method: 'POST',
        body: JSON.stringify(residence)
      });
      
      if (response && response.data) {
        setResidences(prev => [...prev, response.data]);
      } else {
        setResidences(prev => [...prev, { ...residence, id: generateId() }]);
      }
    } catch (error) {
      console.error('Error adding residence:', error);
      setResidences(prev => [...prev, { ...residence, id: generateId() }]);
    }
  };

  const updateResidence = async (id: string, residence: Partial<Residence>) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(residence)
      });
      
      setResidences(prev => prev.map(r => r.id === id ? { ...r, ...residence } : r));
    } catch (error) {
      console.error('Error updating residence:', error);
      setResidences(prev => prev.map(r => r.id === id ? { ...r, ...residence } : r));
    }
  };

  const deleteResidence = async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'DELETE'
      });
      
      setResidences(prev => prev.filter(r => r.id !== id));
      setResidents(prev => prev.filter(r => r.residenceId !== id));
    } catch (error) {
      console.error('Error deleting residence:', error);
      setResidences(prev => prev.filter(r => r.id !== id));
      setResidents(prev => prev.filter(r => r.residenceId !== id));
    }
  };

  // Funções para moradores
  const addResident = async (resident: Omit<Resident, 'id'>) => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RESIDENTS, {
        method: 'POST',
        body: JSON.stringify(resident)
      });
      
      if (response && response.data) {
        setResidents(prev => [...prev, response.data]);
      } else {
        setResidents(prev => [...prev, { ...resident, id: generateId() }]);
      }
    } catch (error) {
      console.error('Error adding resident:', error);
      setResidents(prev => [...prev, { ...resident, id: generateId() }]);
    }
  };

  const updateResident = async (id: string, resident: Partial<Resident>) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(resident)
      });
      
      setResidents(prev => prev.map(r => r.id === id ? { ...r, ...resident } : r));
    } catch (error) {
      console.error('Error updating resident:', error);
      setResidents(prev => prev.map(r => r.id === id ? { ...r, ...resident } : r));
    }
  };

  const deleteResident = async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENTS}/${id}`, {
        method: 'DELETE'
      });
      
      setResidents(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting resident:', error);
      setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  // Funções para funcionários
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEES, {
        method: 'POST',
        body: JSON.stringify(employee)
      });
      
      if (response && response.data) {
        setEmployees(prev => [...prev, response.data]);
      } else {
        setEmployees(prev => [...prev, { ...employee, id: generateId() }]);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setEmployees(prev => [...prev, { ...employee, id: generateId() }]);
    }
  };

  const updateEmployee = async (id: string, employee: Partial<Employee>) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employee)
      });
      
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employee } : e));
    } catch (error) {
      console.error('Error updating employee:', error);
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employee } : e));
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'DELETE'
      });
      
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  // Funções para convidados
  const addGuest = async (guest: Omit<Guest, 'id'>) => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.GUESTS, {
        method: 'POST',
        body: JSON.stringify(guest)
      });
      
      if (response && response.data) {
        setGuests(prev => [...prev, response.data]);
      } else {
        setGuests(prev => [...prev, { ...guest, id: generateId() }]);
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      setGuests(prev => [...prev, { ...guest, id: generateId() }]);
    }
  };

  const updateGuest = async (id: string, guest: Partial<Guest>) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guest)
      });
      
      setGuests(prev => prev.map(g => g.id === id ? { ...g, ...guest } : g));
    } catch (error) {
      console.error('Error updating guest:', error);
      setGuests(prev => prev.map(g => g.id === id ? { ...g, ...guest } : g));
    }
  };

  const deleteGuest = async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'DELETE'
      });
      
      setGuests(prev => prev.filter(g => g.id !== id));
      setAppointments(prev => prev.filter(a => a.guestId !== id));
    } catch (error) {
      console.error('Error deleting guest:', error);
      setGuests(prev => prev.filter(g => g.id !== id));
      setAppointments(prev => prev.filter(a => a.guestId !== id));
    }
  };

  // Funções para agendamentos
  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.APPOINTMENTS, {
        method: 'POST',
        body: JSON.stringify(appointment)
      });
      
      if (response && response.data) {
        setAppointments(prev => [...prev, response.data]);
      } else {
        setAppointments(prev => [...prev, { ...appointment, id: generateId() }]);
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      setAppointments(prev => [...prev, { ...appointment, id: generateId() }]);
    }
  };

  const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointment)
      });
      
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointment } : a));
    } catch (error) {
      console.error('Error updating appointment:', error);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointment } : a));
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, {
        method: 'DELETE'
      });
      
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
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
      employees,
      guests,
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