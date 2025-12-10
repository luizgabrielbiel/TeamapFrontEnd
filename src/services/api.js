// Base URL da API (XAMPP) 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/TeaMap/teamap/backend';

// Sistema de armazenamento em memória (substitui localStorage)
const storage = {
  token: null,
  user: null,
  
  setToken(token) {
    this.token = token;
  },
  
  getToken() {
    return this.token;
  },
  
  setUser(user) {
    this.user = user;
  },
  
  getUser() {
    return this.user;
  },
  
  clear() {
    this.token = null;
    this.user = null;
  }
};

// Helper para fazer requisições
const request = async (endpoint, options = {}) => {
  const token = storage.getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    console.log('🔵 Fazendo requisição para:', `${API_URL}${endpoint}`);
    console.log('🔵 Dados enviados:', options.body);
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    console.log('🟢 Status da resposta:', response.status);
    
    const data = await response.json();
    
    console.log('🟢 Resposta recebida:', data);

    // Verificar se a resposta indica sucesso
    if (!data.success) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('🔴 Erro na API:', error);
    
    // Verificar se é erro de rede
    if (error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o XAMPP está rodando.');
    }
    
    throw error;
  }
};

// AUTH
export const authAPI = {
  // Registrar novo usuário
  register: async (nome, email, senha) => {
    const data = await request('/api/auth/registro.php', {
      method: 'POST',
      body: JSON.stringify({ 
        name: nome,
        email: email, 
        password: senha
      }),
    });

    // Salvar token após registro
    if (data.data && data.data.token) {
      storage.setToken(data.data.token);
      storage.setUser({
        id: data.data.id,
        nome: data.data.nome,
        email: data.data.email
      });
    }
    
    return data;
  },

  // Login
  login: async (email, senha) => {
    const data = await request('/api/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email, 
        password: senha
      }),
    });
    
    // Salvar token
    if (data.data && data.data.token) {
      storage.setToken(data.data.token);
      storage.setUser({
        id: data.data.id,
        nome: data.data.nome,
        email: data.data.email,
        foto_perfil: data.data.foto_perfil
      });
    }
    
    return data;
  },

  // Logout
  logout: () => {
    storage.clear();
  },

  // Obter dados do usuário logado
  getUser: () => {
    return storage.getUser();
  },

  // Verificar se está logado
  isAuthenticated: () => {
    return !!storage.getToken();
  },

  // Obter token
  getToken: () => {
    return storage.getToken();
  }
};

// LOCAIS
export const locaisAPI = {
  // Listar todos os locais
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/locais/listar.php?${params}` : '/api/locais/listar.php';
    return request(endpoint);
  },

  // Criar novo local
  create: async (localData) => {
    return request('/api/locais/criar.php', {
      method: 'POST',
      body: JSON.stringify(localData),
    });
  },
};

// AVALIAÇÕES
export const avaliacoesAPI = {
  // Criar nova avaliação
  create: async (avaliacaoData) => {
    console.log('📝 Criando avaliação:', avaliacaoData);
    return request('/api/avaliacoes/criar.php', {
      method: 'POST',
      body: JSON.stringify(avaliacaoData),
    });
  },

  // Listar avaliações de um local
  list: async (localId) => {
    return request(`/api/avaliacoes/listar.php?local_id=${localId}`);
  },
};

// FAVORITOS
export const favoritosAPI = {
  // Listar favoritos do usuário
  list: async () => {
    return request('/api/favoritos/list.php');
  },

  // Adicionar aos favoritos
  add: async (localId) => {
    return request('/api/favoritos/add.php', {
      method: 'POST',
      body: JSON.stringify({ local_id: localId }),
    });
  },

  // Remover dos favoritos
  remove: async (localId) => {
    return request('/api/favoritos/remove.php', {
      method: 'DELETE',
      body: JSON.stringify({ local_id: localId }),
    });
  },
};

export default {
  authAPI,
  locaisAPI,
  avaliacoesAPI,
  favoritosAPI,
};