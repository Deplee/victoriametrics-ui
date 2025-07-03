import { useState, useEffect } from 'react';
import { ConfigModalProps } from '../types';

const LOCALSTORAGE_NODE_KEY = 'vmselect_url';
const LOCALSTORAGE_ACCOUNT_KEY = 'vmselect_accountid';

const ConfigModal: React.FC<ConfigModalProps> = ({
  onClose,
  onConfigUpdate
}) => {
  const [selectNode, setSelectNode] = useState<string>('http://localhost:8481');
  const [accountID, setAccountID] = useState<string>('0');
  const [timeout, setTimeout] = useState(30000);

  useEffect(() => {
    const savedNode = localStorage.getItem(LOCALSTORAGE_NODE_KEY);
    if (savedNode) setSelectNode(savedNode);
    const savedAccount = localStorage.getItem(LOCALSTORAGE_ACCOUNT_KEY);
    if (savedAccount) setAccountID(savedAccount);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(LOCALSTORAGE_NODE_KEY, selectNode);
    localStorage.setItem(LOCALSTORAGE_ACCOUNT_KEY, accountID);
    onConfigUpdate({ selectNode, accountID, timeout });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Настройки подключения
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Адрес vmselect */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Адрес vmselect:
            </label>
            <input
              type="url"
              value={selectNode}
              onChange={(e) => setSelectNode(e.target.value)}
              placeholder="http://localhost:8481"
              className="input flex-1"
              required
            />
          </div>

          {/* AccountID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AccountID:
            </label>
            <input
              type="text"
              value={accountID}
              onChange={(e) => setAccountID(e.target.value)}
              placeholder="0"
              className="input flex-1"
              required
            />
          </div>

          {/* Timeout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeout (мс):
            </label>
            <input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(parseInt(e.target.value) || 30000)}
              min="1000"
              max="60000"
              step="1000"
              className="input"
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal; 