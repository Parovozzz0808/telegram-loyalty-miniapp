/**
 * API клиент для взаимодействия с backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.Telegram?.WebApp 
    ? 'https://chatty-dingo-30.loca.lt' 
    : 'http://localhost:3001');

/**
 * Базовый fetch с обработкой ошибок
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Получаем initData из Telegram WebApp если доступен
  // Используем прямой доступ к window.Telegram.WebApp.initData
  const initData = window.Telegram?.WebApp?.initData;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(initData && { 'X-Telegram-Init-Data': initData }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Unknown error',
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || errorData.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * API методы
 */
export const api = {
  // Пользователи
  async getUser(telegramId) {
    return apiRequest(`/api/users/${telegramId}`);
  },

  // Авторизация пользователя по телефону
  async authUser(telegramUser, phoneNumber) {
    return apiRequest('/api/users/auth', {
      method: 'POST',
      body: JSON.stringify({
        phone_number: phoneNumber
      }),
    });
  },

  // Обновление данных пользователя (без изменения телефона)
  async updateUser(userData) {
    return apiRequest('/api/users', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async getAllUsers(limit = 100) {
    return apiRequest(`/api/users?limit=${limit}`);
  },

  // Статистика
  async getStats() {
    return apiRequest('/api/stats');
  },

  // Баллы лояльности
  async getLoyaltyPoints(userId) {
    return apiRequest(`/api/loyalty/points/${userId}`);
  },

  async getTransactionHistory(userId, limit = 50, offset = 0) {
    return apiRequest(`/api/loyalty/transactions/${userId}?limit=${limit}&offset=${offset}`);
  },

  // Промокоды
  async applyPromoCode(code, userId) {
    return apiRequest('/api/loyalty/promo/apply', {
      method: 'POST',
      body: JSON.stringify({ code, userId }),
    });
  },

  // Награды
  async getRewards() {
    return apiRequest('/api/loyalty/rewards');
  },

  async redeemReward(rewardId, userId) {
    return apiRequest('/api/loyalty/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId, userId }),
    });
  },
};

export default api;

