import React from 'react';
import { TimeRange } from '../types';

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  useTimeRange: boolean;
  onUseTimeRangeChange: (use: boolean) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRange,
  onTimeRangeChange,
  useTimeRange,
  onUseTimeRangeChange
}) => {
  const quickRanges = [
    { label: 'Последние 5 минут', start: '-5m', end: 'now', step: '15s' },
    { label: 'Последние 15 минут', start: '-15m', end: 'now', step: '15s' },
    { label: 'Последний час', start: '-1h', end: 'now', step: '1m' },
    { label: 'Последние 6 часов', start: '-6h', end: 'now', step: '5m' },
    { label: 'Последние 24 часа', start: '-24h', end: 'now', step: '15m' },
    { label: 'Последние 7 дней', start: '-7d', end: 'now', step: '1h' },
  ];

  const handleQuickRange = (range: typeof quickRanges[0]) => {
    const now = new Date();
    const start = new Date(now.getTime() + parseDuration(range.start));
    
    onTimeRangeChange({
      start: start.toISOString(),
      end: now.toISOString(),
      step: range.step
    });
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/^(-?\d+)([smhdwy])$/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers: Record<string, number> = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000,
      'w': 7 * 24 * 60 * 60 * 1000,
      'y': 365 * 24 * 60 * 60 * 1000
    };
    
    return value * multipliers[unit];
  };

  return (
    <div className="space-y-4">
      {/* Переключатель использования временного диапазона */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useTimeRange"
          checked={useTimeRange}
          onChange={(e) => onUseTimeRangeChange(e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="useTimeRange" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Использовать временной диапазон
        </label>
      </div>

      {useTimeRange && (
        <>
          {/* Быстрые диапазоны */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Быстрые диапазоны:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleQuickRange(range)}
                  className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ручной ввод */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ручной ввод:
            </h3>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Начало:
              </label>
              <input
                type="datetime-local"
                value={timeRange.start.slice(0, 16)}
                onChange={(e) => onTimeRangeChange({
                  ...timeRange,
                  start: new Date(e.target.value).toISOString()
                })}
                className="input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Конец:
              </label>
              <input
                type="datetime-local"
                value={timeRange.end.slice(0, 16)}
                onChange={(e) => onTimeRangeChange({
                  ...timeRange,
                  end: new Date(e.target.value).toISOString()
                })}
                className="input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Шаг:
              </label>
              <select
                value={timeRange.step}
                onChange={(e) => onTimeRangeChange({
                  ...timeRange,
                  step: e.target.value
                })}
                className="input text-sm"
              >
                <option value="1s">1 секунда</option>
                <option value="5s">5 секунд</option>
                <option value="15s">15 секунд</option>
                <option value="30s">30 секунд</option>
                <option value="1m">1 минута</option>
                <option value="5m">5 минут</option>
                <option value="15m">15 минут</option>
                <option value="30m">30 минут</option>
                <option value="1h">1 час</option>
                <option value="2h">2 часа</option>
                <option value="6h">6 часов</option>
                <option value="12h">12 часов</option>
                <option value="1d">1 день</option>
              </select>
            </div>
          </div>
        </>
      )}

      {!useTimeRange && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
          Запрос будет выполнен для текущего момента времени (мгновенный запрос)
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector; 