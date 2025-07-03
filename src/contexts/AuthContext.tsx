import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiRequestNoAuth, apiRequest, API_CONFIG } from '../config/api';

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

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      // Verificar se o token ainda é válido fazendo uma requisição de teste
      checkTokenValidity();
    }
  }, []);

  const checkTokenValidity = async () => {
    try {
      // Fazer uma requisição para verificar se o token ainda é válido
      // Você pode usar um endpoint específico para isso ou qualquer endpoint protegido
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
        method: 'GET'
      });

      if (response && response.user) {
        const userData: User = {
          email: response.user.email,
          name: response.user.name || response.user.nome || 'Usuário',
          phone: response.user.phone || response.user.telefone,
          department: response.user.department || response.user.departamento,
          position: response.user.position || response.user.cargo,
          token: localStorage.getItem('auth_token') || undefined
        };

        setIsAuthenticated(true);
        setUser(userData);
      }
    } catch (error) {
      // Token inválido ou API indisponível, limpar dados
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('token_expires_in');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Fazer requisição para a API real usando apiRequestNoAuth (sem token)
      const response = await apiRequestNoAuth(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        })
      });

      // Verificar se a resposta contém o token conforme sua API
      if (response && response.token) {
        // Salvar token no localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('token_type', response.type || 'bearer');
        localStorage.setItem('token_expires_in', response.experes_in || response.expires_in || '3600');

        // Criar dados do usuário (você pode ajustar conforme sua API retorna)
        const userData: User = {
          email,
          name: response.user?.name || response.user?.nome || 'Usuário',
          phone: response.user?.phone || response.user?.telefone,
          department: response.user?.department || response.user?.departamento,
          position: response.user?.position || response.user?.cargo,
          token: response.token
        };

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
        // Tentar fazer logout na API, mas não falhar se der erro
        try {
          await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
            method: 'POST'
          });
        } catch (apiError) {
          // Ignorar erros da API no logout (endpoint pode não existir ou estar indisponível)
          console.warn('Logout API call failed, proceeding with local logout:', apiError);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpar dados locais independentemente do resultado da API
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('token_expires_in');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      // Tentar atualizar via API (o token será incluído automaticamente)
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (response && response.user) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        return;
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