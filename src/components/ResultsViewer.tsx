import React from 'react';
import { VMQueryResult } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ResultsViewerProps {
  results: VMQueryResult | null;
  loading: boolean;
  error: string | null;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({
  results,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Выполняется запрос...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Ошибка</h3>
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <p>Введите запрос и нажмите "Выполнить" для получения результатов</p>
      </div>
    );
  }

  if (results.status === 'error') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Ошибка запроса</h3>
        <p className="text-red-700 dark:text-red-300 text-sm">{results.error}</p>
      </div>
    );
  }

  if (!results.data || !results.data.result || results.data.result.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  const { resultType, result } = results.data;

  // Подготовка данных для графика
  const prepareChartData = () => {
    if (resultType === 'matrix') {
      return result.map((series, index) => ({
        label: formatSeriesLabel(series),
        data: series.values?.map(([timestamp, value]) => ({
          x: timestamp * 1000, // Конвертируем в миллисекунды
          y: parseFloat(value)
        })) || [],
        borderColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(index * 137.5) % 360}, 70%, 50%, 0.1)`,
        tension: 0.1
      }));
    } else if (resultType === 'vector') {
      return result.map((series, index) => ({
        label: formatSeriesLabel(series),
        data: series.value ? [{
          x: series.value[0] * 1000,
          y: parseFloat(series.value[1])
        }] : [],
        borderColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(index * 137.5) % 360}, 70%, 50%, 0.1)`,
        pointRadius: 6
      }));
    }
    return [];
  };

  const formatSeriesLabel = (series: any) => {
    const metric = series.metric || {};
    const name = metric.__name__ || 'unknown';
    const labels = Object.entries(metric)
      .filter(([key]) => key !== '__name__')
      .map(([key, value]) => `${key}="${value}"`)
      .join(', ');
    
    return labels ? `${name}{${labels}}` : name;
  };

  const chartData = {
    datasets: prepareChartData()
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            second: 'HH:mm:ss',
            minute: 'HH:mm',
            hour: 'MMM dd HH:mm',
            day: 'MMM dd',
          }
        },
        title: {
          display: true,
          text: 'Время'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Значение'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-blue-800 dark:text-blue-200 text-sm font-medium">Тип результата</h3>
          <p className="text-blue-900 dark:text-blue-100 text-lg font-semibold">{resultType}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-green-800 dark:text-green-200 text-sm font-medium">Количество серий</h3>
          <p className="text-green-900 dark:text-green-100 text-lg font-semibold">{result.length}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-purple-800 dark:text-purple-200 text-sm font-medium">Тип данных</h3>
          <p className="text-purple-900 dark:text-purple-100 text-lg font-semibold">
            {resultType === 'matrix' ? 'Временной ряд' : 'Мгновенное значение'}
          </p>
        </div>
      </div>

      {/* График */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Таблица данных */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Данные</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Метрика
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Значение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Время
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {result.map((series, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                    {formatSeriesLabel(series)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {series.value ? parseFloat(series.value[1]).toFixed(4) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {series.value ? new Date(series.value[0] * 1000).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsViewer; 