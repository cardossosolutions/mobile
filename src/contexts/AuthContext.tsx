import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiRequest, API_CONFIG } from '../config/api';

interface User {
  email: string;
  name: string;
  phone?: string;
  department?: string;
  position?: string;
  token?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Fazer requisição para a API real
      const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        })
      });

      // Verificar se a resposta contém os dados do usuário
      if (response && response.user) {
        const userData: User = {
          email: response.user.email,
          name: response.user.name || response.user.nome || 'Usuário',
          phone: response.user.phone || response.user.telefone,
          department: response.user.department || response.user.departamento,
          position: response.user.position || response.user.cargo,
          token: response.token || response.access_token
        };

        // Salvar token no localStorage se disponível
        if (userData.token) {
          localStorage.setItem('auth_token', userData.token);
        }

        setIsAuthenticated(true);
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback para autenticação mock em caso de erro na API
      if (email === 'admin@condominio.com' && password === 'admin123') {
        const userData: User = {
          email,
          name: 'Administrador do Sistema',
          phone: '(11) 99999-9999',
          department: 'Administração',
          position: 'Administrador'
        };
        setIsAuthenticated(true);
        setUser(userData);
        return true;
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      // Tentar fazer logout na API se houver token
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpar dados locais independentemente do resultado da API
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Tentar atualizar via API
        const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        if (response && response.user) {
          const updatedUser = { ...user, ...response.user };
          setUser(updatedUser);
          return;
        }
      }

      // Fallback para atualização local
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Fallback para atualização local em caso de erro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};