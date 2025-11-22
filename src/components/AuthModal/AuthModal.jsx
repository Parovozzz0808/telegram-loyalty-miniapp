import React, { useState } from 'react';
import api from '../../utils/api';
import './AuthModal.css';

function AuthModal({ onAuthSuccess }) {
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
      let telegramUser = null;
      
      // Способ 1: Через @tma.js/sdk
      try {
        const { retrieveLaunchParams } = await import('@tma.js/sdk');
        const { initData } = retrieveLaunchParams();
        telegramUser = initData?.user;
      } catch (sdkError) {
        console.warn('SDK error:', sdkError);
      }
      
      // Способ 2: Через window.Telegram.WebApp
      if (!telegramUser && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      }
      
      // Способ 3: Парсинг initData
      if (!telegramUser && window.Telegram?.WebApp?.initData) {
        try {
          const initData = window.Telegram.WebApp.initData;
          const params = new URLSearchParams(initData);
          const userParam = params.get('user');
          if (userParam) {
            telegramUser = JSON.parse(userParam);
          }
        } catch (parseError) {
          console.warn('Parse error:', parseError);
        }
      }

      if (!telegramUser || !telegramUser.id) {
        throw new Error('Не удалось получить данные пользователя из Telegram. Пожалуйста, откройте приложение через Telegram.');
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

