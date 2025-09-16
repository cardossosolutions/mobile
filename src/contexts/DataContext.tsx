import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiRequest, API_CONFIG } from '../config/api';
import { useToast } from './ToastContext';

// Interfaces para tipagem (mantendo as mesmas do código original)
interface Residence {
  id: string;
  name: string;
  active: boolean;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: number;
  city_name?: string;
  state: number;
  name_state?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  permission: string;
  status: string;
}

interface Guest {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  plate?: string;
  observation?: string;
  residence?: string;
}

interface Appointment {
  id: string;
  name: string;
  cpf: string;
  responsible: string;
  dateBegin: string;
  dateEnding: string;
  visitor_id?: number;
}

interface ServiceProvider {
  id: number;
  name: string;
  mobile: string;
  rg: string;
  cpf: string;
  plate: string | null;
  date_start: string;
  date_ending: string;
  observation: string;
}

interface Delivery {
  id: number;
  ecommerce: string;
  ecommerce_id: number | null;
  quantity: number;
  date_start: string;
  date_ending: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface DataContextType {
  // Residences
  residences: Residence[];
  residencePagination: PaginationData | null;
  loadResidences: (page?: number, search?: string) => Promise<void>;
  addResidence: (residenceData: any) => Promise<void>;
  updateResidence: (id: string, residenceData: any) => Promise<void>;
  deleteResidence: (id: string) => Promise<void>;

  // Employees
  employees: Employee[];
  employeePagination: PaginationData | null;
  loadEmployees: (page?: number, search?: string) => Promise<void>;
  addEmployee: (employeeData: any) => Promise<any>;
  updateEmployee: (id: string, employeeData: any) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Guests
  guests: Guest[];
  guestPagination: PaginationData | null;
  loadGuests: (page?: number, search?: string) => Promise<void>;
  addGuest: (guestData: any) => Promise<void>;
  updateGuest: (id: string, guestData: any) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;

  // Appointments
  appointments: Appointment[];
  appointmentPagination: PaginationData | null;
  loadAppointments: (page?: number, search?: string) => Promise<void>;
  addAppointment: (appointmentData: any) => Promise<void>;
  updateAppointment: (id: string, appointmentData: any) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Service Providers
  serviceProviders: ServiceProvider[];
  serviceProviderPagination: PaginationData | null;
  loadServiceProviders: (page?: number, search?: string) => Promise<void>;
  addServiceProvider: (providerData: any) => Promise<void>;
  updateServiceProvider: (id: number, providerData: any) => Promise<void>;
  deleteServiceProvider: (id: number) => Promise<void>;

  // Deliveries
  deliveries: Delivery[];
  deliveryPagination: PaginationData | null;
  loadDeliveries: (page?: number, search?: string) => Promise<void>;
  addDelivery: (deliveryData: any) => Promise<void>;
  updateDelivery: (id: number, deliveryData: any) => Promise<void>;
  deleteDelivery: (id: number) => Promise<void>;

  // Actions
  registerAction: (registerActionData: any) => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { showSuccess, showError } = useToast();

  // States (mantendo a mesma estrutura)
  const [residences, setResidences] = useState<Residence[]>([]);
  const [residencePagination, setResidencePagination] = useState<PaginationData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeePagination, setEmployeePagination] = useState<PaginationData | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestPagination, setGuestPagination] = useState<PaginationData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentPagination, setAppointmentPagination] = useState<PaginationData | null>(null);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [serviceProviderPagination, setServiceProviderPagination] = useState<PaginationData | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveryPagination, setDeliveryPagination] = useState<PaginationData | null>(null);

  // Implementação das funções (mantendo a mesma lógica, apenas adaptando para React Native)
  const loadResidences = useCallback(async (page: number = 1, search: string = '') => {
    try {
      let url = `${API_CONFIG.ENDPOINTS.RESIDENCES}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiRequest(url, { method: 'GET' });

      if (response && response.data) {
        setResidences(response.data);
        setResidencePagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar residências:', error);
      showError('Erro ao carregar residências', 'Não foi possível carregar a lista de residências.');
    }
  }, [showError]);

  const addResidence = useCallback(async (residenceData: any) => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.RESIDENCES, {
        method: 'POST',
        body: JSON.stringify(residenceData)
      });
      showSuccess('Residência cadastrada!', 'A residência foi cadastrada com sucesso.');
    } catch (error) {
      showError('Erro ao cadastrar residência', 'Não foi possível cadastrar a residência.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateResidence = useCallback(async (id: string, residenceData: any) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(residenceData)
      });
      showSuccess('Residência atualizada!', 'Os dados da residência foram atualizados.');
    } catch (error) {
      showError('Erro ao atualizar residência', 'Não foi possível atualizar a residência.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteResidence = useCallback(async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.RESIDENCES}/${id}`, {
        method: 'DELETE'
      });
      showSuccess('Residência excluída!', 'A residência foi excluída com sucesso.');
    } catch (error) {
      showError('Erro ao excluir residência', 'Não foi possível excluir a residência.');
      throw error;
    }
  }, [showSuccess, showError]);

  // Implementar outras funções seguindo o mesmo padrão...
  const loadEmployees = useCallback(async (page: number = 1, search: string = '') => {
    try {
      let url = `${API_CONFIG.ENDPOINTS.EMPLOYEES}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiRequest(url, { method: 'GET' });

      if (response && response.data) {
        setEmployees(response.data);
        setEmployeePagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
      }
    } catch (error) {
      showError('Erro ao carregar funcionários', 'Não foi possível carregar a lista de funcionários.');
    }
  }, [showError]);

  const addEmployee = useCallback(async (employeeData: any) => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.EMPLOYEES, {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      showSuccess('Funcionário cadastrado!', 'O funcionário foi cadastrado com sucesso.');
      return response;
    } catch (error) {
      showError('Erro ao cadastrar funcionário', 'Não foi possível cadastrar o funcionário.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateEmployee = useCallback(async (id: string, employeeData: any) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData)
      });
      showSuccess('Funcionário atualizado!', 'Os dados do funcionário foram atualizados.');
    } catch (error) {
      showError('Erro ao atualizar funcionário', 'Não foi possível atualizar o funcionário.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${id}`, {
        method: 'DELETE'
      });
      showSuccess('Funcionário excluído!', 'O funcionário foi excluído com sucesso.');
    } catch (error) {
      showError('Erro ao excluir funcionário', 'Não foi possível excluir o funcionário.');
      throw error;
    }
  }, [showSuccess, showError]);

  // Implementações simplificadas para as outras entidades
  const loadGuests = useCallback(async (page: number = 1, search: string = '') => {
    try {
      let url = `${API_CONFIG.ENDPOINTS.GUESTS_LIST}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiRequest(url, { method: 'GET' });

      if (response && response.data) {
        setGuests(response.data);
        setGuestPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
      }
    } catch (error) {
      showError('Erro ao carregar convidados', 'Não foi possível carregar a lista de convidados.');
    }
  }, [showError]);

  const addGuest = useCallback(async (guestData: any) => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.GUESTS, {
        method: 'POST',
        body: JSON.stringify(guestData)
      });
      showSuccess('Convidado cadastrado!', 'O convidado foi cadastrado com sucesso.');
    } catch (error) {
      showError('Erro ao cadastrar convidado', 'Não foi possível cadastrar o convidado.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateGuest = useCallback(async (id: string, guestData: any) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guestData)
      });
      showSuccess('Convidado atualizado!', 'Os dados do convidado foram atualizados.');
    } catch (error) {
      showError('Erro ao atualizar convidado', 'Não foi possível atualizar o convidado.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteGuest = useCallback(async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.GUESTS}/${id}`, {
        method: 'DELETE'
      });
      showSuccess('Convidado excluído!', 'O convidado foi excluído com sucesso.');
    } catch (error) {
      showError('Erro ao excluir convidado', 'Não foi possível excluir o convidado.');
      throw error;
    }
  }, [showSuccess, showError]);

  const loadAppointments = useCallback(async (page: number = 1, search: string = '') => {
    try {
      let url = `${API_CONFIG.ENDPOINTS.APPOINTMENTS}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiRequest(url, { method: 'GET' });

      if (response && response.data) {
        setAppointments(response.data);
        setAppointmentPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
      }
    } catch (error) {
      showError('Erro ao carregar agendamentos', 'Não foi possível carregar a lista de agendamentos.');
    }
  }, [showError]);

  const addAppointment = useCallback(async (appointmentData: any) => {
    try {
      console.log('PAYLOAD',appointmentData);
      await apiRequest(API_CONFIG.ENDPOINTS.APPOINTMENTS_REGISTER, {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
      showSuccess('Agendamento criado!', 'O agendamento foi criado com sucesso.');
    } catch (error) {
      showError('Erro ao criar agendamento', 'Não foi possível criar o agendamento.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateAppointment = useCallback(async (id: string, appointmentData: any) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS_REGISTER}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });
      showSuccess('Agendamento atualizado!', 'O agendamento foi atualizado com sucesso.');
    } catch (error) {
      showError('Erro ao atualizar agendamento', 'Não foi possível atualizar o agendamento.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.APPOINTMENTS_REGISTER}/${id}`, {
        method: 'DELETE'
      });
      showSuccess('Agendamento excluído!', 'O agendamento foi excluído com sucesso.');
    } catch (error) {
      showError('Erro ao excluir agendamento', 'Não foi possível excluir o agendamento.');
      throw error;
    }
  }, [showSuccess, showError]);

  const loadServiceProviders = useCallback(async (page: number = 1, search: string = '') => {
    try {
      let url = `${API_CONFIG.ENDPOINTS.PROVIDERS}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiRequest(url, { method: 'GET' });

      if (response && response.data) {
        setServiceProviders(response.data);
        setServiceProviderPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
      }
    } catch (error) {
      showError('Erro ao carregar prestadores', 'Não foi possível carregar a lista de prestadores.');
    }
  }, [showError]);

  const addServiceProvider = useCallback(async (providerData: any) => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.PROVIDERS, {
        method: 'POST',
        body: JSON.stringify(providerData)
      });
      showSuccess('Prestador cadastrado!', 'O prestador foi cadastrado com sucesso.');
    } catch (error) {
      showError('Erro ao cadastrar prestador', 'Não foi possível cadastrar o prestador.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateServiceProvider = useCallback(async (id: number, providerData: any) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(providerData)
      });
      showSuccess('Prestador atualizado!', 'Os dados do prestador foram atualizados.');
    } catch (error) {
      showError('Erro ao atualizar prestador', 'Não foi possível atualizar o prestador.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteServiceProvider = useCallback(async (id: number) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${id}`, {
        method: 'DELETE'
      });
      showSuccess('Prestador excluído!', 'O prestador foi excluído com sucesso.');
    } catch (error) {
      showError('Erro ao excluir prestador', 'Não foi possível excluir o prestador.');
      throw error;
    }
  }, [showSuccess, showError]);

  const loadDeliveries = useCallback(async (page: number = 1, search: string = '') => {
    try {
      let url = `${API_CONFIG.ENDPOINTS.DELIVERIES_LIST}?page=${page}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiRequest(url, { method: 'GET' });

      if (response && response.data) {
        setDeliveries(response.data);
        setDeliveryPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        });
      }
    } catch (error) {
      showError('Erro ao carregar entregas', 'Não foi possível carregar a lista de entregas.');
    }
  }, [showError]);

  const addDelivery = useCallback(async (deliveryData: any) => {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.DELIVERIES, {
        method: 'POST',
        body: JSON.stringify(deliveryData)
      });
      showSuccess('Entrega cadastrada!', 'A entrega foi cadastrada com sucesso.');
    } catch (error) {
      showError('Erro ao cadastrar entrega', 'Não foi possível cadastrar a entrega.');
      throw error;
    }
  }, [showSuccess, showError]);

  const updateDelivery = useCallback(async (id: number, deliveryData: any) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.DELIVERIES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(deliveryData)
      });
      showSuccess('Entrega atualizada!', 'Os dados da entrega foram atualizados.');
    } catch (error) {
      showError('Erro ao atualizar entrega', 'Não foi possível atualizar a entrega.');
      throw error;
    }
  }, [showSuccess, showError]);

  const deleteDelivery = useCallback(async (id: number) => {
    try {
      await apiRequest(`${API_CONFIG.ENDPOINTS.DELIVERIES}/${id}`, {
        method: 'DELETE'
      });
      showSuccess('Entrega excluída!', 'A entrega foi excluída com sucesso.');
    } catch (error) {
      showError('Erro ao excluir entrega', 'Não foi possível excluir a entrega.');
      throw error;
    }
  }, [showSuccess, showError]);

  const registerAction = useCallback(async (registerData: any) => {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.ACTION_GATE, {
        method: 'POST',
        body: JSON.stringify(registerData)
      });
      showSuccess('Ação registrada!', 'A ação foi registrada com sucesso.');
      return response;
    } catch (error) {
      showError('Erro ao registrar', 'Não foi possível registrar a ação.');
      throw error;
    }
  }, [showSuccess, showError]);

  return (
      <DataContext.Provider value={{
        residences,
        residencePagination,
        loadResidences,
        addResidence,
        updateResidence,
        deleteResidence,
        employees,
        employeePagination,
        loadEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        guests,
        guestPagination,
        loadGuests,
        addGuest,
        updateGuest,
        deleteGuest,
        appointments,
        appointmentPagination,
        loadAppointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        serviceProviders,
        serviceProviderPagination,
        loadServiceProviders,
        addServiceProvider,
        updateServiceProvider,
        deleteServiceProvider,
        deliveries,
        deliveryPagination,
        loadDeliveries,
        addDelivery,
        updateDelivery,
        deleteDelivery,
        registerAction
      }}>
        {children}
      </DataContext.Provider>
  );
};