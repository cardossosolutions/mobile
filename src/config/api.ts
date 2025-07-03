// Configuração centralizada da API
export const API_CONFIG = {
  // Host base da API - alterado para o seu ngrok
  BASE_URL: 'https://cb86-2804-45c4-5c3-2400-9cdd-75aa-68d-d6b5.ngrok-free.app/api',
  
  // Endpoints disponíveis
  ENDPOINTS: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER_PROFILE: '/user/me',
    COMPANIES: '/companies',
    RESIDENCES: '/residences',
    RESIDENTS: '/residents',
    EMPLOYEES: '/employees',
    GUESTS: '/guests',
    APPOINTMENTS: '/appointments'
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Função para atualizar o host da API
export const updateApiHost = (newHost: string) => {
  API_CONFIG.BASE_URL = newHost.endsWith('/api') ? newHost : `${newHost}/api`;
};

// Função para obter URL completa do endpoint
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para obter headers com autenticação
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const tokenType = localStorage.getItem('token_type') || 'bearer';
  
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)} ${token}`;
  }
  
  return headers;
};

// Função para verificar se a resposta é HTML (indicando erro de configuração da API)
const isHtmlResponse = (text: string): boolean => {
  return text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
};

// Função para fazer requisições HTTP com autenticação automática
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const url = getApiUrl(endpoint);
  
  // Combinar headers padrão com headers de autenticação e headers customizados
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };
  
  const config: RequestInit = {
    ...options,
    headers
  };

  try {
    console.log(`🌐 Fazendo requisição para: ${url}`);
    console.log(`📋 Headers:`, headers);
    console.log(`⚙️ Config:`, config);
    
    const response = await fetch(url, config);
    
    console.log(`📊 Status da resposta: ${response.status}`);
    
    // Verificar se o token expirou (401 Unauthorized)
    if (response.status === 401) {
      console.log('🔒 Token expirado, limpando dados de autenticação...');
      // Token expirado, limpar dados de autenticação
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('token_expires_in');
      
      // Redirecionar para login ou recarregar a página
      window.location.reload();
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log(`📝 Resposta (texto):`, responseText);
    
    // Verificar se a resposta é HTML (indicando problema de configuração da API)
    if (isHtmlResponse(responseText)) {
      throw new Error('API returned HTML instead of JSON - check API configuration');
    }
    
    // Tentar fazer parse do JSON
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

// Função para fazer requisições sem autenticação (para login, por exemplo)
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
    console.log(`🌐 Fazendo requisição (sem auth) para: ${url}`);
    console.log(`📋 Headers:`, config.headers);
    console.log(`⚙️ Config:`, config);
    
    const response = await fetch(url, config);
    
    console.log(`📊 Status da resposta: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log(`📝 Resposta (texto):`, responseText);
    
    // Verificar se a resposta é HTML (indicando problema de configuração da API)
    if (isHtmlResponse(responseText)) {
      throw new Error('API returned HTML instead of JSON - check API configuration');
    }
    
    // Tentar fazer parse do JSON
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