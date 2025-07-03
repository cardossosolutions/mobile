import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Company {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  email: string;
  telefone: string;
  celular: string;
}

interface Residence {
  id: string;
  bloco: string;
  apartamento: string;
  proprietario: string;
  telefone: string;
  email: string;
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
  residences: Residence[];
  residents: Resident[];
  employees: Employee[];
  guests: Guest[];
  appointments: Appointment[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addResidence: (residence: Omit<Residence, 'id'>) => void;
  updateResidence: (id: string, residence: Partial<Residence>) => void;
  deleteResidence: (id: string) => void;
  addResident: (resident: Omit<Resident, 'id'>) => void;
  updateResident: (id: string, resident: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data
const mockCompanies: Company[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Segurança Total Ltda',
    nomeFantasia: 'SecTotal',
    cep: '01310-100',
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: 'Sala 501',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    email: 'contato@sectotal.com.br',
    telefone: '(11) 3333-4444',
    celular: '(11) 99999-8888'
  },
  {
    id: '2',
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'Limpeza Express S.A.',
    nomeFantasia: 'CleanExpress',
    cep: '04567-890',
    logradouro: 'Rua das Flores',
    numero: '250',
    complemento: '',
    bairro: 'Vila Madalena',
    cidade: 'São Paulo',
    estado: 'SP',
    email: 'admin@cleanexpress.com.br',
    telefone: '(11) 2222-3333',
    celular: '(11) 88888-7777'
  },
  {
    id: '3',
    cnpj: '11.222.333/0001-44',
    razaoSocial: 'Manutenção & Cia Ltda',
    nomeFantasia: 'ManutençãoPro',
    cep: '02345-678',
    logradouro: 'Rua dos Técnicos',
    numero: '789',
    complemento: 'Galpão B',
    bairro: 'Santana',
    cidade: 'São Paulo',
    estado: 'SP',
    email: 'servicos@manutencaopro.com.br',
    telefone: '(11) 4444-5555',
    celular: '(11) 77777-6666'
  }
];

const mockResidences: Residence[] = [
  {
    id: '1',
    bloco: 'A',
    apartamento: '101',
    proprietario: 'João Silva Santos',
    telefone: '(11) 99999-1111',
    email: 'joao.silva@email.com'
  },
  {
    id: '2',
    bloco: 'A',
    apartamento: '102',
    proprietario: 'Maria Oliveira Costa',
    telefone: '(11) 88888-2222',
    email: 'maria.oliveira@email.com'
  },
  {
    id: '3',
    bloco: 'B',
    apartamento: '201',
    proprietario: 'Carlos Eduardo Ferreira',
    telefone: '(11) 77777-3333',
    email: 'carlos.ferreira@email.com'
  },
  {
    id: '4',
    bloco: 'B',
    apartamento: '202',
    proprietario: 'Ana Paula Rodrigues',
    telefone: '(11) 66666-4444',
    email: 'ana.rodrigues@email.com'
  },
  {
    id: '5',
    bloco: 'C',
    apartamento: '301',
    proprietario: 'Roberto Lima Souza',
    telefone: '(11) 55555-5555',
    email: 'roberto.lima@email.com'
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
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [residences, setResidences] = useState<Residence[]>(mockResidences);
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const generateId = () => Date.now().toString();

  const addCompany = (company: Omit<Company, 'id'>) => {
    setCompanies(prev => [...prev, { ...company, id: generateId() }]);
  };

  const updateCompany = (id: string, company: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...company } : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const addResidence = (residence: Omit<Residence, 'id'>) => {
    setResidences(prev => [...prev, { ...residence, id: generateId() }]);
  };

  const updateResidence = (id: string, residence: Partial<Residence>) => {
    setResidences(prev => prev.map(r => r.id === id ? { ...r, ...residence } : r));
  };

  const deleteResidence = (id: string) => {
    setResidences(prev => prev.filter(r => r.id !== id));
    // Also remove residents from this residence
    setResidents(prev => prev.filter(r => r.residenceId !== id));
  };

  const addResident = (resident: Omit<Resident, 'id'>) => {
    setResidents(prev => [...prev, { ...resident, id: generateId() }]);
  };

  const updateResident = (id: string, resident: Partial<Resident>) => {
    setResidents(prev => prev.map(r => r.id === id ? { ...r, ...resident } : r));
  };

  const deleteResident = (id: string) => {
    setResidents(prev => prev.filter(r => r.id !== id));
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    setEmployees(prev => [...prev, { ...employee, id: generateId() }]);
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employee } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const addGuest = (guest: Omit<Guest, 'id'>) => {
    setGuests(prev => [...prev, { ...guest, id: generateId() }]);
  };

  const updateGuest = (id: string, guest: Partial<Guest>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...guest } : g));
  };

  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
    // Also remove appointments for this guest
    setAppointments(prev => prev.filter(a => a.guestId !== id));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    setAppointments(prev => [...prev, { ...appointment, id: generateId() }]);
  };

  const updateAppointment = (id: string, appointment: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointment } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DataContext.Provider value={{
      companies,
      residences,
      residents,
      employees,
      guests,
      appointments,
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
      deleteAppointment
    }}>
      {children}
    </DataContext.Provider>
  );
};