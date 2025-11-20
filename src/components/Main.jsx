import React, { useEffect, useState } from 'react';
import { init, retrieveLaunchParams } from '@tma.js/sdk';
import api from '../utils/api';
import './Main.css';

function Main() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Инициализируем Telegram Mini App SDK
        init();
        const { initData } = retrieveLaunchParams();
        
        // Получаем данные пользователя из Telegram
        const telegramUser = initData?.user;
        
        if (telegramUser) {
          setUser(telegramUser);
          
          try {
            // Сохраняем/обновляем пользователя на сервере
            await api.createOrUpdateUser(telegramUser);
            
            // Получаем статистику
            const statsData = await api.getStats();
            setStats(statsData);
            
            // Получаем баллы лояльности (если endpoint доступен)
            try {
              const points = await api.getLoyaltyPoints(telegramUser.id);
              setLoyaltyPoints(points);
            } catch (err) {
              console.warn('Loyalty points not available:', err);
            }
          } catch (apiError) {
            console.error('API error:', apiError);
            setError(apiError.message || 'Ошибка при загрузке данных');
          }
        } else {
          setError('Не удалось получить данные пользователя из Telegram');
        }
        
        // Настраиваем кнопки Telegram через SDK
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();
          
          tg.MainButton.setText('Сохранить').show();
          tg.MainButton.onClick(() => {
            tg.showPopup({
              title: 'Успех!',
              message: 'Данные сохранены!',
              buttons: [{ type: 'ok' }]
            });
          });
          
          tg.BackButton.show();
          tg.BackButton.onClick(() => {
            tg.close();
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error.message || 'Ошибка инициализации приложения');
        setLoading(false);
      }
    };

    initApp();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-message">
          <h2>❌ Ошибка</h2>
          <p>{error}</p>
          <button 
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 Система лояльности</h1>
        <p>Добро пожаловать в программу лояльности!</p>
      </header>

      <main className="main">
        {user && (
          <section className="user-card">
            <h2>👤 Ваш профиль</h2>
            <div className="user-info">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Имя:</strong> {user.first_name}</p>
              <p><strong>Фамилия:</strong> {user.last_name || 'Не указана'}</p>
              <p><strong>Username:</strong> @{user.username || 'Не указан'}</p>
              <p><strong>Язык:</strong> {user.language_code || 'Не указан'}</p>
            </div>
          </section>
        )}

        {loyaltyPoints && (
          <section className="loyalty-card">
            <h2>⭐ Ваши баллы</h2>
            <div className="loyalty-info">
              <p className="points-display">
                <strong>{loyaltyPoints.points || 0}</strong> баллов
              </p>
              <p><small>Всего заработано: {loyaltyPoints.total_earned || 0}</small></p>
              <p><small>Всего потрачено: {loyaltyPoints.total_spent || 0}</small></p>
            </div>
          </section>
        )}

        {stats && (
          <section className="stats-card">
            <h2>📊 Статистика приложения</h2>
            <div className="stats-info">
              <p><strong>Всего пользователей:</strong> {stats.total_users}</p>
              <div className="recent-users">
                <strong>Недавно зарегистрировались:</strong>
                <ul>
                  {stats.recent_users.map((u, index) => (
                    <li key={index}>
                      {u.first_name} (@{u.username}) - {new Date(u.created_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="actions">
          <h2>⚡ Действия</h2>
          <button 
            className="btn primary"
            onClick={() => window.Telegram?.WebApp?.showPopup({
              title: 'Тест',
              message: 'Это тестовое всплывающее окно!',
              buttons: [{ type: 'ok' }]
            })}
          >
            Показать Popup
          </button>
          
          <button 
            className="btn secondary"
            onClick={() => window.Telegram?.WebApp?.sendData(JSON.stringify({ action: 'test', data: 'hello' }))}
          >
            Отправить данные в бот
          </button>
          
          <button 
            className="btn danger"
            onClick={() => window.Telegram?.WebApp?.close()}
          >
            Закрыть приложение
          </button>
        </section>
      </main>
    </div>
  );
}

export default Main;