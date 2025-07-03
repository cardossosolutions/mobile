import React from 'react';
import { 
  Home, 
  Building, 
  Users, 
  UserCheck, 
  Calendar, 
  Shield,
  Menu,
  X,
  Eye
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'visitor-schedule', label: 'Visualizar Agendamentos', icon: Eye },
    { id: 'companies', label: 'Empresas', icon: Building },
    { id: 'residences', label: 'Residências', icon: Home },
    { id: 'employees', label: 'Funcionários', icon: Users },
    { id: 'guests', label: 'Convidados', icon: UserCheck },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
  ];

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
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;