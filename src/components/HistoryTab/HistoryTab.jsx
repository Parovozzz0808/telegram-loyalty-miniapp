import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './HistoryTab.css';

function HistoryTab({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (user?.id) {
        try {
          const history = await api.getTransactionHistory(user.id);
          setTransactions(Array.isArray(history) ? history : []);
        } catch (error) {
          console.error('Error loading transaction history:', error);
          setTransactions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="history-tab">
        <div className="loading-state">Загрузка истории...</div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="history-tab">
        <h2 className="history-title">История покупок</h2>
        <div className="empty-state">
          <p>История покупок пуста</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-tab">
      <h2 className="history-title">История покупок</h2>
      <div className="transactions-list">
        {transactions.map((transaction, index) => (
          <div key={transaction.id || index} className="transaction-item">
            <div className="transaction-main">
              <div className="transaction-info">
                <div className="transaction-type">
                  {transaction.transaction_type === 'earned' ? 'Начисление' : transaction.transaction_type === 'spent' ? 'Списание' : 'Покупка'}
                </div>
                <div className="transaction-date">
                  {transaction.created_at 
                    ? new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Дата не указана'}
                </div>
              </div>
              <div className={`transaction-amount ${transaction.points_change > 0 ? 'positive' : 'negative'}`}>
                {transaction.points_change > 0 ? '+' : ''}{transaction.points_change || 0}
              </div>
            </div>
            {transaction.description && (
              <div className="transaction-description">{transaction.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryTab;

