import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ResidenceManagement from '../management/ResidenceManagement';
import EmployeeManagement from '../management/EmployeeManagement';
import ServiceProviderManagement from '../management/ServiceProviderManagement';
import GuestManagement from '../management/GuestManagement';
import AppointmentManagement from '../management/AppointmentManagement';
import VisitorScheduleView from '../views/VisitorScheduleView';
import ProviderScheduleView from '../views/ProviderScheduleView';
import DeliveryScheduleView from '../views/DeliveryScheduleView';
import DeliveryManagement from '../management/DeliveryManagement';
import { useData } from '../../contexts/DataContext';

const Dashboard: React.FC = () => {
  // Recuperar seção ativa do localStorage ou usar 'home' como padrão
  const [activeSection, setActiveSection] = useState(() => {
    // Não usar localStorage na inicialização, será definido baseado na role
    console.log('🔄 Dashboard inicializando - aguardando role do usuário...');
    return 'visitor-schedule'; // Valor temporário
  });
  
  const { loadUserProfile } = useData();
  const { user } = useAuth();

  // Definir seção inicial baseada na role do usuário
  useEffect(() => {
    if (user?.role) {
      console.log(`🎯 Definindo seção inicial para role ${user.role}...`);
      
      let firstSection = 'visitor-schedule'; // fallback
      
      switch (user.role) {
        case 4:
          // Role 4: Primeira opção é visualizar agendamentos
          firstSection = 'visitor-schedule';
          break;
        case 5:
          // Role 5: Primeira opção é visualizar agendamentos
          firstSection = 'visitor-schedule';
          break;
        case 6:
          // Role 6: Primeira opção é convidados
          firstSection = 'guests';
          break;
        default:
          firstSection = 'visitor-schedule';
      }
      
      console.log(`✅ Seção inicial definida: ${firstSection}`);
      setActiveSection(firstSection);
    }
  }, [user?.role]); // Executar quando a role for carregada

  // Salvar seção ativa no localStorage sempre que mudar (exceto na inicialização)
  useEffect(() => {
    if (user?.role) { // Só salvar se já tiver role carregada
      console.log('💾 Salvando seção ativa no localStorage:', activeSection);
      localStorage.setItem('dashboard_active_section', activeSection);
    }
  }, [activeSection, user?.role]);

  // Carregar apenas dados do usuário quando o dashboard for montado
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('🚀 Inicializando Dashboard...');
        await loadUserProfile();
        console.log('✅ Dashboard inicializado com sucesso');
      } catch (error) {
        console.warn('⚠️ Erro ao carregar dados do usuário:', error);
      }
    };

    initializeDashboard();
  }, []);

  // Função para mudar seção (será passada para o Sidebar)
  const handleSectionChange = (section: string) => {
    console.log('🔄 Mudando seção para:', section);
    setActiveSection(section);
  };

  const renderContent = () => {
    console.log('🎯 Renderizando conteúdo para seção:', activeSection);
    
    switch (activeSection) {
      case 'residences':
        return <ResidenceManagement />;
      case 'service-providers':
        return <ServiceProviderManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'guests':
        return <GuestManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'visitor-schedule':
        return <VisitorScheduleView />;
      case 'provider-schedule':
        return <ProviderScheduleView />;
      case 'delivery-schedule':
        return <DeliveryScheduleView />;
      case 'deliveries':
        return <DeliveryManagement />;
      default:
        console.warn('⚠️ Seção desconhecida:', activeSection, '- redirecionando para home');
        // Se a seção não existir, voltar para visitor-schedule
        setActiveSection('visitor-schedule');
        return <VisitorScheduleView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange} 
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;