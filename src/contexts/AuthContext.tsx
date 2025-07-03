import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiRequestNoAuth, apiRequest, API_CONFIG } from '../config/api';

interface User {
  id?: number;
  company_id?: number;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  position?: string;
  status?: string;
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
      console.log('🔑 Token encontrado no localStorage, verificando validade...');
      // Verificar se o token ainda é válido fazendo uma requisição de teste
      checkTokenValidity();
    }
  }, []);

  const checkTokenValidity = async () => {
    try {
      console.log('🔍 Verificando validade do token...');
      // Fazer uma requisição para verificar se o token ainda é válido
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
        method: 'GET'
      });

      console.log('✅ Token válido, dados do usuário:', response);

      if (response) {
        // Processar dados do usuário conforme a estrutura da sua API
        const userData: User = {
          id: response.id,
          company_id: response.company_id,
          email: response.email,
          name: response.name,
          status: response.status,
          phone: response.phone || response.telefone,
          department: response.department || response.departamento,
          position: response.position || response.cargo,
          token: localStorage.getItem('auth_token') || undefined
        };

        setIsAuthenticated(true);
        setUser(userData);
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('user_profile', JSON.stringify(userData));
        console.log('💾 Dados do usuário salvos no localStorage');
      }
    } catch (error) {
      console.error('❌ Token inválido ou API indisponível:', error);
      // Token inválido ou API indisponível, limpar dados
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('token_expires_in');
      localStorage.removeItem('user_profile');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentando fazer login...');
      // Fazer requisição para a API real usando apiRequestNoAuth (sem token)
      const response = await apiRequestNoAuth(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        })
      });

      console.log('📨 Resposta do login:', response);

      // Verificar se a resposta contém o token conforme sua API
      if (response && response.token) {
        console.log('✅ Login bem-sucedido, salvando token...');
        
        // Salvar token no localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('token_type', response.type || 'bearer');
        localStorage.setItem('token_expires_in', response.experes_in || response.expires_in || '3600');

        // Agora fazer requisição para obter dados do usuário
        try {
          const userResponse = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
            method: 'GET'
          });

          console.log('👤 Dados do usuário obtidos:', userResponse);

          if (userResponse) {
            const userData: User = {
              id: userResponse.id,
              company_id: userResponse.company_id,
              email: userResponse.email,
              name: userResponse.name,
              status: userResponse.status,
              phone: userResponse.phone || userResponse.telefone,
              department: userResponse.department || userResponse.departamento,
              position: userResponse.position || userResponse.cargo,
              token: response.token
            };

            setIsAuthenticated(true);
            setUser(userData);
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('user_profile', JSON.stringify(userData));
            console.log('💾 Dados do usuário salvos no localStorage');
            
            return true;
          }
        } catch (userError) {
          console.warn('⚠️ Erro ao obter dados do usuário, usando dados básicos:', userError);
          
          // Usar dados básicos se não conseguir obter dados completos
          const userData: User = {
            email,
            name: response.user?.name || response.user?.nome || email.split('@')[0],
            phone: response.user?.phone || response.user?.telefone,
            department: response.user?.department || response.user?.departamento,
            position: response.user?.position || response.user?.cargo,
            token: response.token
          };

          setIsAuthenticated(true);
          setUser(userData);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Fallback para autenticação mock em caso de erro na API
      if (email === 'admin@condominio.com' && password === 'admin123') {
        console.log('🔄 Usando autenticação mock...');
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
      console.log('🚪 Fazendo logout...');
      // Tentar fazer logout na API se houver token
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Tentar fazer logout na API, mas não falhar se der erro
        try {
          await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
            method: 'POST'
          });
          console.log('✅ Logout na API realizado com sucesso');
        } catch (apiError) {
          // Ignorar erros da API no logout (endpoint pode não existir ou estar indisponível)
          console.warn('⚠️ Logout API call failed, proceeding with local logout:', apiError);
        }
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      // Limpar dados locais independentemente do resultado da API
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('token_expires_in');
      localStorage.removeItem('user_profile');
      setIsAuthenticated(false);
      setUser(null);
      console.log('🧹 Dados locais limpos');
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      console.log('📝 Atualizando perfil do usuário...');
      // Tentar atualizar via API (o token será incluído automaticamente)
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (response && response.user) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        console.log('✅ Perfil atualizado via API');
        return;
      }

      // Fallback para atualização local
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        console.log('✅ Perfil atualizado localmente');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      
      // Fallback para atualização local em caso de erro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        console.log('✅ Perfil atualizado localmente (fallback)');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};