import React, { useState } from 'react';
import api from '../../utils/api';
import './AuthModal.css';

function AuthModal({ onAuthSuccess, telegramUser: initialTelegramUser }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Получаем данные пользователя из Telegram
      let telegramUser = initialTelegramUser || null;
      
      // Если пользователь не передан, пытаемся получить его
      if (!telegramUser) {
        // Способ 1: Через @tma.js/sdk
        try {
          const { retrieveLaunchParams } = await import('@tma.js/sdk');
          const { initData } = retrieveLaunchParams();
          telegramUser = initData?.user;
          console.log('User from @tma.js/sdk:', telegramUser);
        } catch (sdkError) {
          console.warn('SDK error:', sdkError);
        }
        
        // Способ 2: Через window.Telegram.WebApp.initDataUnsafe
        if (!telegramUser && window.Telegram?.WebApp?.initDataUnsafe?.user) {
          telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
          console.log('User from window.Telegram.WebApp.initDataUnsafe:', telegramUser);
        }
        
        // Способ 3: Парсинг initData
        if (!telegramUser && window.Telegram?.WebApp?.initData) {
          try {
            const initData = window.Telegram.WebApp.initData;
            const params = new URLSearchParams(initData);
            const userParam = params.get('user');
            if (userParam) {
              telegramUser = JSON.parse(userParam);
              console.log('User parsed from initData:', telegramUser);
            }
          } catch (parseError) {
            console.warn('Parse error:', parseError);
          }
        }

        // Способ 4: Проверяем все возможные пути к данным пользователя
        if (!telegramUser) {
          // Пытаемся получить через разные свойства
          const tg = window.Telegram?.WebApp;
          if (tg) {
            // Проверяем все возможные места
            telegramUser = tg.initDataUnsafe?.user || 
                          tg.startParam?.user ||
                          (tg.initData ? (() => {
                            try {
                              const params = new URLSearchParams(tg.initData);
                              const userStr = params.get('user');
                              return userStr ? JSON.parse(userStr) : null;
                            } catch (e) {
                              return null;
                            }
                          })() : null);
          }
        }
      }

      // Если все еще нет данных пользователя, но мы в Telegram окружении
      if (!telegramUser || !telegramUser.id) {
        const isTelegram = window.Telegram?.WebApp?.version;
        
        if (isTelegram) {
          // В Telegram, но данные недоступны - пытаемся получить хотя бы что-то
          const tg = window.Telegram?.WebApp;
          
          // Пытаемся получить ID из других источников
          let userId = null;
          if (tg?.initDataUnsafe?.user?.id) {
            userId = tg.initDataUnsafe.user.id;
          } else if (tg?.initData) {
            try {
              const params = new URLSearchParams(tg.initData);
              const userStr = params.get('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                userId = user.id;
              }
            } catch (e) {
              console.warn('Could not parse user from initData:', e);
            }
          }
          
          // Если все еще нет ID, создаем временный объект для разработки
          if (!userId) {
            console.warn('⚠️ Telegram ID недоступен, создаем временный объект пользователя');
            // Генерируем временный ID на основе текущего времени
            userId = Math.floor(Date.now() / 1000); // Unix timestamp как временный ID
          }
          
          telegramUser = {
            id: userId,
            first_name: name || 'User',
            username: null,
            language_code: tg?.languageCode || 'ru',
            is_bot: false
          };
          
          console.log('Created temporary user object:', telegramUser);
        } else {
          throw new Error('Не удалось получить данные пользователя из Telegram. Пожалуйста, откройте приложение через Telegram.');
        }
      }

      // Авторизуем пользователя с телефоном
      const response = await api.authUser(telegramUser, phone);
      onAuthSuccess(response.user || telegramUser);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Ошибка при регистрации. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <h2 className="auth-title">Регистрация</h2>
        <p className="auth-subtitle">Для использования приложения необходимо зарегистрироваться</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;

