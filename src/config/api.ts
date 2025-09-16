import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_CONFIG = {
  // BASE_URL: 'http://localhost:8080/api',
  BASE_URL: 'http://192.168.1.12:8080/api',

  ENDPOINTS: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    SEND_RESET: '/send-reset',
    RESET_PASSWORD: '/reset-password',
    USER_PROFILE: '/user/me',
    PASSWORD_CHANGE: '/password/change',
    COMPANIES: '/company',
    RESIDENCES: '/residence',
    RESIDENTS: '/resident',
    EMPLOYEES: '/employees',
    PROVIDERS: '/provider',
    PROVIDERS_SCHEDULE: '/provider/list-providers',
    GUESTS: '/visitors',
    GUESTS_LIST: '/visitors/list-visitors',
    GUESTS_SELECT: '/visitors/list-visitors-select',
    APPOINTMENTS: '/visitors/list-register',
    APPOINTMENTS_REGISTER: '/visitors/register-visitor',
    VISITOR_SCHEDULE: '/visitors/schedule',
    STATES: '/infos/state',
    CITIES: '/infos/city',
    DELIVERIES: '/deliveries',
    DELIVERIES_LIST: '/deliveries/list-residence',
    ECOMMERCES: '/infos/ecommerces',
    ACTION_GATE: '/gate/actions',
  },
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const updateApiHost = (newHost: string) => {
  API_CONFIG.BASE_URL = newHost.endsWith('/api') ? newHost : `${newHost}/api`;
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('auth_token');
  const tokenType = await AsyncStorage.getItem('token_type') || 'bearer';
  
  const headers = {};

  if (token) {
    headers['Authorization'] = `${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)} ${token}`;
  }
  
  return headers;
};

const isHtmlResponse = (text: string): boolean => {
  return text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
};

const handleTokenExpired = async () => {
  console.log('🔒 Token expirado - fazendo logout automático...');
  await AsyncStorage.multiRemove(['auth_token', 'token_type', 'token_expires_in', 'user_profile']);
  // Em React Native, você pode usar navigation para ir para tela de login
  // ou recarregar o app state
};

export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  isFormData: boolean = false,
): Promise<any> => {
  const url = getApiUrl(endpoint);
  const authHeaders = await getAuthHeaders();

  const headers = {
    ...authHeaders,
    ...(!isFormData && {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
  };
  
  const config: RequestInit = {
    ...options,
    headers
  };

  try {
    console.log(`🌐 Fazendo requisição para: ${url}`);
    
    const response = await fetch(url, config);
    
    console.log(`📊 Status da resposta: ${response.status}`);
    
    if (response.status === 401) {
      console.log('🔒 Token expirado ou inválido (401)');
      await handleTokenExpired();
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    
    if (isHtmlResponse(responseText)) {
      throw new Error('API returned HTML instead of JSON - check API configuration');
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log(`✅ Dados parseados:`, data);
      return data;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error('Invalid JSON response from API');
    }
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
};

export const apiRequestNoAuth = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const url = getApiUrl(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers
    }
  };

  try {
    console.log(`🌐 Fazendooo requisição (sem auth) para: ${url}`);

    console.log('📩 ANTES',config);

    const response = await fetch(url, config);

    console.log('📩 Objeto response:', response);


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    
    if (isHtmlResponse(responseText)) {
      throw new Error('API returned HTML instead of JSON - check API configuration');
    }
    
    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (parseError) {
      throw new Error('Invalid JSON response from API');
    }
  } catch (error) {
    console.error('❌ API Request Error:', error);
    throw error;
  }
};