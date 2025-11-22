import React from 'react';
import './InfoTab.css';

function InfoTab() {
  return (
    <div className="info-tab">
      <h2 className="info-title">О компании</h2>
      
      <div className="info-content">
        <div className="info-section">
          <h3>О нас</h3>
          <p>
            Мы рады приветствовать вас в нашей программе лояльности! 
            Наша компания стремится предоставить лучший сервис и качественные продукты 
            для наших клиентов. Благодаря программе лояльности вы можете получать бонусы 
            за каждую покупку и использовать их для получения скидок и специальных предложений.
          </p>
        </div>

        <div className="info-section">
          <h3>Контакты</h3>
          <div className="contact-item">
            <span className="contact-label">Телефон:</span>
            <span className="contact-value">+7 (999) 123-45-67</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <span className="contact-value">info@company.ru</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Адрес:</span>
            <span className="contact-value">г. Москва, ул. Примерная, д. 1</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Режим работы:</span>
            <span className="contact-value">Пн-Вс: 9:00 - 21:00</span>
          </div>
        </div>

        <div className="info-section">
          <h3>Как накапливать бонусы</h3>
          <p>
            За каждую покупку вы получаете бонусы, которые можно использовать 
            для оплаты следующих покупок. Размер бонусов зависит от суммы покупки 
            и вашего статуса в программе лояльности.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InfoTab;

