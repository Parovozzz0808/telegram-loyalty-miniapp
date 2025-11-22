import React from 'react';
import './CardTab.css';

function CardTab({ user, loyaltyPoints }) {
  // Пример QR-кода (можно заменить на реальный)
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LOYALTY-CARD-' + (user?.id || '12345');

  return (
    <div className="card-tab">
      <h2 className="card-title">Информация по карте лояльности</h2>
      
      <div className="qr-container">
        <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
      </div>

      <div className="card-info">
        <div className="info-row">
          <span className="info-label">Тип карты:</span>
          <span className="info-value">Стандартная</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Номер карты:</span>
          <span className="info-value">{user?.id ? `CARD-${user.id.toString().padStart(8, '0')}` : 'CARD-00000000'}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Доступно бонусов:</span>
          <span className="info-value points">{loyaltyPoints?.points || 0}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Сумма покупок:</span>
          <span className="info-value">{loyaltyPoints?.total_earned ? (loyaltyPoints.total_earned * 100) : 0} ₽</span>
        </div>
      </div>
    </div>
  );
}

export default CardTab;

