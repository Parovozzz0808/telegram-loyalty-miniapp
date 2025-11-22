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
      // Создаем пользователя с предоставленными данными
      // В реальном приложении ID должен быть из Telegram
      const userData = {
        id: Date.now(), // Временный ID для разработки
        first_name: name,
        phone_number: phone,
      };

      const savedUser = await api.createOrUpdateUser(userData);
      onAuthSuccess(savedUser || userData);
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

