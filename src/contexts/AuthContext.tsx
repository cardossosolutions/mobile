import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  role?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Inicializando autenticação...');
      
      try {
        const savedToken = await AsyncStorage.getItem('auth_token');
        const savedUser = await AsyncStorage.getItem('user_profile');
        
        if (savedToken && savedUser) {
          console.log('🔑 Token e dados do usuário encontrados no AsyncStorage');
          
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Usuário autenticado com dados salvos:', userData);
          
          checkTokenValidity();
        } else {
          console.log('❌ Nenhum token ou dados de usuário encontrados');
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        clearAuthData();
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuthData = async () => {
    console.log('🧹 Limpando dados de autenticação...');
    await AsyncStorage.multiRemove(['auth_token', 'token_type', 'token_expires_in', 'user_profile']);
    setIsAuthenticated(false);
    setUser(null);
  };

  const checkTokenValidity = async () => {
    try {
      console.log('🔍 Verificando validade do token em background...');
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
        method: 'GET'
      });

      console.log('✅ Token válido, dados atualizados:', response);

      if (response) {
        const userData: User = {
          id: response.id,
          company_id: response.company_id,
          email: response.email,
          name: response.name,
          status: response.status,
          phone: response.phone || response.telefone,
          department: response.department || response.departamento,
          position: response.position || response.cargo,
          token: await AsyncStorage.getItem('auth_token') || undefined,
          role: response.role_id
        };

        setUser(userData);
        await AsyncStorage.setItem('user_profile', JSON.stringify(userData));
        console.log('💾 Dados do usuário atualizados no AsyncStorage');
      }
    } catch (error) {
      console.warn('⚠️ Token pode estar expirado ou API indisponível:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔒 Token expirado, fazendo logout...');
        clearAuthData();
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentando fazer login...');
      setIsLoading(true);
      
      const response = await apiRequestNoAuth(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      console.log('📨 Resposta do login:', response);

      if (response && response.token) {
        console.log('✅ Login bem-sucedido, salvando token...');
        
        await AsyncStorage.multiSet([
          ['auth_token', response.token],
          ['token_type', response.type || 'bearer'],
          ['token_expires_in', response.experes_in || response.expires_in || '3600']
        ]);

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
              token: response.token,
              role: userResponse.role_id
            };

            setIsAuthenticated(true);
            setUser(userData);
            
            await AsyncStorage.setItem('user_profile', JSON.stringify(userData));
            console.log('💾 Dados do usuário salvos no AsyncStorage');
            
            return true;
          }
        } catch (userError) {
          console.warn('⚠️ Erro ao obter dados do usuário, usando dados básicos:', userError);
          
          const userData: User = {
            email,
            name: response.user?.name || response.user?.nome || email.split('@')[0],
            phone: response.user?.phone || response.user?.telefone,
            department: response.user?.department || response.user?.departamento,
            position: response.user?.position || response.user?.cargo,
            token: response.token,
            role: response.user?.role_id
          };

          setIsAuthenticated(true);
          setUser(userData);
          await AsyncStorage.setItem('user_profile', JSON.stringify(userData));
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Fallback para autenticação mock
      if (email === 'admin@condominio.com' && password === 'admin123') {
        console.log('🔄 Usando autenticação mock...');
        const userData: User = {
          email,
          name: 'Administrador do Sistema',
          phone: '(11) 99999-9999',
          department: 'Administração',
          position: 'Administrador',
          role: 4
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        await AsyncStorage.multiSet([
          ['user_profile', JSON.stringify(userData)],
          ['auth_token', 'mock_token_' + Date.now()]
        ]);
        return true;
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('auth_token');
      if (token && !token.startsWith('mock_token_')) {
        try {
          await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
            method: 'POST'
          });
          console.log('✅ Logout na API realizado com sucesso');
        } catch (apiError) {
          console.warn('⚠️ Logout API call failed, proceeding with local logout:', apiError);
        }
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      await clearAuthData();
      setIsLoading(false);
      console.log('🧹 Logout concluído');
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      console.log('📝 Atualizando perfil do usuário...');
      setIsLoading(true);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (response && response.user) {
        const updatedUser = { ...user, ...response.user };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
        console.log('✅ Perfil atualizado via API');
        return;
      }

      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
        console.log('✅ Perfil atualizado localmente');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
        console.log('✅ Perfil atualizado localmente (fallback)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      updateUserProfile,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};