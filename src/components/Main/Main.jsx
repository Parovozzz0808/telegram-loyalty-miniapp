import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { init, retrieveLaunchParams } from '@tma.js/sdk';
import api from '../../utils/api';
import CardTab from '../CardTab/CardTab';
import HistoryTab from '../HistoryTab/HistoryTab';
import InfoTab from '../InfoTab/InfoTab';
import AuthModal from '../AuthModal/AuthModal';
import BottomNavigation from '../BottomNavigation/BottomNavigation';
import './Main.css';

function Main() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        let telegramUser = null;
        
        // Способ 1: Попытка через @tma.js/sdk
        try {
          await init();
          const { initData } = retrieveLaunchParams();
          telegramUser = initData?.user;
          console.log('User from @tma.js/sdk:', telegramUser);
        } catch (sdkError) {
          console.warn('SDK initialization error:', sdkError);
        }
        
        // Способ 2: Попытка через window.Telegram.WebApp.initDataUnsafe
        if (!telegramUser && window.Telegram?.WebApp?.initDataUnsafe?.user) {
          telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
          console.log('User from window.Telegram.WebApp.initDataUnsafe:', telegramUser);
        }
        
        // Способ 3: Попытка парсинга initData напрямую
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
            console.warn('Error parsing initData:', parseError);
          }
        }
        
        // Проверяем, запущено ли приложение в Telegram
        const isTelegram = window.Telegram?.WebApp?.version;
        console.log('Is Telegram environment:', !!isTelegram);
        
        if (telegramUser) {
          setUser(telegramUser);
          
          try {
            // Проверяем, существует ли пользователь в базе данных
            try {
              const existingUser = await api.getUser(telegramUser.id);
              setUserExists(true);
              setUser(existingUser);
              
              // Проверяем, авторизован ли пользователь (есть ли телефон)
              if (existingUser.phone_number) {
                // Получаем баллы лояльности
                try {
                  const points = await api.getLoyaltyPoints(telegramUser.id);
                  setLoyaltyPoints(points);
                } catch (err) {
                  console.warn('Loyalty points not available:', err);
                  // Устанавливаем значения по умолчанию
                  setLoyaltyPoints({ points: 0, total_earned: 0, total_spent: 0 });
                }
              } else {
                // Пользователь существует, но не авторизован
                console.log('User exists but not authorized, showing auth modal');
                setShowAuth(true);
                setUserExists(false);
              }
            } catch (getUserError) {
              // Пользователь не найден или не авторизован - показываем форму авторизации
              console.log('User not found or not authorized, showing auth modal');
              setShowAuth(true);
              setUserExists(false);
            }
          } catch (apiError) {
            console.error('API error:', apiError);
            setError(apiError.message || 'Ошибка при загрузке данных');
          }
        } else {
          // Если не в Telegram, показываем предупреждение для разработки
          if (!isTelegram) {
            console.warn('⚠️ Приложение запущено не в Telegram.');
            // Для разработки показываем форму авторизации
            setShowAuth(true);
          } else {
            setError('Не удалось получить данные пользователя из Telegram.');
          }
        }
        
        // Настраиваем Telegram WebApp
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();
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

  const handleAuthSuccess = async (userData) => {
    try {
      // Пользователь уже сохранен через authUser, просто обновляем состояние
      setUser(userData);
      setUserExists(true);
      setShowAuth(false);
      
      // Получаем баллы лояльности
      try {
        const userId = userData?.telegram_id || userData?.id;
        if (userId) {
          const points = await api.getLoyaltyPoints(userId);
          setLoyaltyPoints(points);
        }
      } catch (err) {
        console.warn('Loyalty points not available:', err);
        setLoyaltyPoints({ points: 0, total_earned: 0, total_spent: 0 });
      }
    } catch (error) {
      console.error('Error after auth:', error);
      setError('Ошибка при сохранении данных пользователя');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error && !showAuth) {
    return (
      <div className="app">
        <div className="error-message">
          <h2>Ошибка</h2>
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
      {showAuth && !userExists && (
        <AuthModal onAuthSuccess={handleAuthSuccess} />
      )}
      
      {!showAuth && (
        <>
          <main className="main-content">
            <Routes>
              <Route 
                path="/" 
                element={<CardTab user={user} loyaltyPoints={loyaltyPoints} />} 
              />
              <Route 
                path="/history" 
                element={<HistoryTab user={user} />} 
              />
              <Route 
                path="/info" 
                element={<InfoTab />} 
              />
            </Routes>
          </main>
          
          <BottomNavigation />
        </>
      )}
    </div>
  );
}

export default Main;

