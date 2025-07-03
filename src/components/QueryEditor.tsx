import { useRef } from 'react';

interface QueryEditorProps {
  query: string;
  onQueryChange: (query: string) => void;
  onExecute: () => void;
  loading: boolean;
}

const QueryEditor: React.FC<QueryEditorProps> = ({
  query,
  onQueryChange,
  onExecute,
  loading
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onExecute();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQueryChange(e.target.value);
  };

  const handleTextareaClick = () => {};
  const handleTextareaKeyUp = () => {};

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleTextareaChange}
          onClick={handleTextareaClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleTextareaKeyUp}
          placeholder="Введите PromQL или MetricsQL запрос..."
          className="input font-mono text-sm h-32 resize-none"
          disabled={loading}
        />
      </div>

      {/* Горячие клавиши */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Ctrl+Enter для выполнения запроса
      </div>

      {/* Быстрые запросы */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Быстрые запросы:
        </h3>
        <div className="flex flex-wrap gap-2">
          {['up', 'rate(http_requests_total[5m])', 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'].map((quickQuery) => (
            <button
              key={quickQuery}
              onClick={() => onQueryChange(quickQuery)}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-mono break-all max-w-full"
            >
              {quickQuery}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueryEditor; 