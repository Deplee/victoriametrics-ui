import { useState, useEffect } from 'react';
import { Play, Clock, Settings, Sun, Moon, Database } from 'lucide-react';
import { vmApi } from './services/vmApi';
import { VMQueryResult, TimeRange, QueryHistory } from './types';
import QueryEditor from './components/QueryEditor';
import TimeRangeSelector from './components/TimeRangeSelector';
import ResultsViewer from './components/ResultsViewer';
import ConfigModal from './components/ConfigModal';

const LOCALSTORAGE_NODE_KEY = 'vmselect_url';
const LOCALSTORAGE_ACCOUNT_KEY = 'vmselect_accountid';
const LOCALSTORAGE_THEME_KEY = 'vmui_theme';
const LOCALSTORAGE_USE_TIMERANGE_KEY = 'vmui_use_time_range';

function App() {
  const [query, setQuery] = useState('up');
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 3600000).toISOString(), // 1 час назад
    end: new Date().toISOString(),
    step: '15s'
  });
  const [useTimeRange, setUseTimeRange] = useState(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_USE_TIMERANGE_KEY);
    return saved ? saved === 'true' : true;
  });
  const [results, setResults] = useState<VMQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_THEME_KEY);
    return saved ? saved === 'dark' : false;
  });
  const [showConfig, setShowConfig] = useState(false);
  const [selectNode, setSelectNode] = useState<string>(() => localStorage.getItem(LOCALSTORAGE_NODE_KEY) || 'http://localhost:8481');
  const [accountID, setAccountID] = useState<string>(() => localStorage.getItem(LOCALSTORAGE_ACCOUNT_KEY) || '0');

  // Переключение темной темы и сохранение в localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCALSTORAGE_THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCALSTORAGE_THEME_KEY, 'light');
    }
  }, [darkMode]);

  // Обновление vmApi при смене selectNode или accountID
  useEffect(() => {
    vmApi.updateConfig({ selectNode, accountID });
  }, [selectNode, accountID]);

  // Сохраняем выбор чекбокса в localStorage
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_USE_TIMERANGE_KEY, useTimeRange ? 'true' : 'false');
  }, [useTimeRange]);

  const executeQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let result: VMQueryResult;
      if (useTimeRange && timeRange.start && timeRange.end && timeRange.step) {
        result = await vmApi.queryRange(query, timeRange);
      } else {
        result = await vmApi.query(query);
      }
      setResults(result);
      const historyItem: QueryHistory = {
        id: Date.now().toString(),
        query,
        timestamp: Date.now(),
        timeRange: useTimeRange && timeRange.start && timeRange.end ? timeRange : undefined
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Храним последние 10 запросов
    } catch (error: any) {
      setError(error.message || 'Ошибка выполнения запроса');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (historyItem: QueryHistory) => {
    setQuery(historyItem.query);
    if (historyItem.timeRange) {
      setTimeRange(historyItem.timeRange);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Database className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Victoria Metrics UI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowConfig(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Настройки</span>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn btn-secondary p-2"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Левая панель */}
          <div className="lg:col-span-1 space-y-6">
            {/* Редактор запросов */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Запрос
              </h2>
              <QueryEditor
                query={query}
                onQueryChange={setQuery}
                onExecute={executeQuery}
                loading={loading}
              />
            </div>
            {/* Временной диапазон */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Временной диапазон
              </h2>
              <TimeRangeSelector
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                useTimeRange={useTimeRange}
                onUseTimeRangeChange={setUseTimeRange}
              />
            </div>
            {/* История запросов */}
            {history.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  История
                </h2>
                <div className="space-y-2">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-mono"
                    >
                      <div className="truncate">{item.query}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Основная область */}
          <div className="lg:col-span-3">
            {/* Кнопка выполнения */}
            <div className="mb-6">
              <button
                onClick={executeQuery}
                disabled={loading || !query.trim()}
                className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                <span>{loading ? 'Выполняется...' : 'Выполнить'}</span>
              </button>
            </div>
            {/* Результаты */}
            <div className="card p-6">
              <ResultsViewer
                results={results}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Модальное окно настроек */}
      {showConfig && (
        <ConfigModal
          onClose={() => setShowConfig(false)}
          onConfigUpdate={(config) => {
            setSelectNode(config.selectNode);
            setAccountID(config.accountID);
            vmApi.updateConfig({ selectNode: config.selectNode, accountID: config.accountID });
          }}
        />
      )}
    </div>
  );
}

export default App; 