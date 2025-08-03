import React from 'react';
import { 
  Home, 
  Building, 
  Briefcase,
  Users, 
  UserCheck, 
  Calendar, 
  Shield,
  Menu,
  X,
  Eye,
  Package
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  // Definir todos os itens de menu possíveis
  const allMenuItems = [
    { id: 'visitor-schedule', label: 'Visualizar Agendamentos', icon: Eye },
    { id: 'provider-schedule', label: 'Visualizar Prestadores', icon: Briefcase },
    { id: 'delivery-schedule', label: 'Visualizar Entregas', icon: Package },
    { id: 'residences', label: 'Residências', icon: Home },
    { id: 'employees', label: 'Funcionários', icon: Users },
    { id: 'guests', label: 'Convidados', icon: UserCheck },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'service-providers', label: 'Prestadores de Serviços', icon: Briefcase },
    { id: 'deliveries', label: 'Entregas', icon: Package },
  ];

  // Filtrar itens baseado na role do usuário
  const getMenuItemsByRole = (role?: number) => {
    if (!role) {
      console.log('🔒 Nenhuma role definida, mostrando menu padrão');
      return allMenuItems; // Fallback para mostrar tudo se não houver role
    }

    console.log(`🎯 Filtrando menu para role: ${role}`);

    const commonItems = [
      'visitor-schedule',    // Visualizar Agendamentos
      'provider-schedule',   // Visualizar Prestadores  
      'delivery-schedule'    // Visualizar Entregas
    ];

    let allowedItems: string[] = [...commonItems];

    switch (role) {
      case 4:
        // Role 4: Comum + Residências + Funcionários
        allowedItems.push('residences', 'employees');
        console.log('👑 Role 4 (Admin): Acesso a residências e funcionários');
        break;
      
      case 5:
        // Role 5: Apenas itens comuns
        console.log('👤 Role 5 (Visualização): Apenas visualização');
        break;
      
      case 6:
        // Role 6: Comum + Convidados + Agendamentos + Prestadores + Entregas
        allowedItems.push('guests', 'appointments', 'service-providers', 'deliveries');
        console.log('🔧 Role 6 (Operacional): Acesso a gestão operacional');
        break;
      
      default:
        console.log(`⚠️ Role ${role} não reconhecida, mostrando menu padrão`);
        return allMenuItems; // Fallback para roles não reconhecidas
    }

    return allMenuItems.filter(item => allowedItems.includes(item.id));
  };

  const menuItems = getMenuItemsByRole(user?.role);

  console.log(`📋 Menu filtrado para role ${user?.role}:`, menuItems.map(item => item.label));
  const handleMenuClick = (itemId: string) => {
    console.log('📱 Sidebar - Item clicado:', itemId);
    setActiveSection(itemId);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Portal do Visitante</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <IconComponent className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
              {!isCollapsed && (
                <span className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Indicador da seção ativa quando collapsed */}
      {isCollapsed && (
        <div className="fixed left-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {menuItems.find(item => item.id === activeSection)?.label}
        </div>
      )}
    </div>
  );
};

export default Sidebar;