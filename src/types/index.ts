export interface VMQueryResult {
  status: 'success' | 'error';
  data?: {
    resultType: 'vector' | 'matrix' | 'scalar' | 'string';
    result: VMTimeSeries[];
  };
  error?: string;
  errorType?: string;
  warnings?: string[];
}

export interface VMTimeSeries {
  metric: Record<string, string>;
  values?: [number, string][];
  value?: [number, string];
  __name__?: string;
}

export interface VMSeriesResult {
  status: 'success' | 'error';
  data: Array<Record<string, string>>;
  error?: string;
}

export interface VMLabelsResult {
  status: 'success' | 'error';
  data: string[];
  error?: string;
}

export interface VMLabelValuesResult {
  status: 'success' | 'error';
  data: string[];
  error?: string;
}

export interface VMConfig {
  selectNode: string;
  accountID: string;
  defaultQuery: string;
  defaultTimeRange: TimeRange;
  refreshInterval: number;
}

export interface TimeRange {
  start: string;
  end: string;
  step: string;
}

export interface AppState {
  query: string;
  timeRange: TimeRange;
  results: VMQueryResult | null;
  loading: boolean;
  error: string | null;
  history: QueryHistory[];
  metrics: string[];
  labels: string[];
}

export interface QueryHistory {
  id: string;
  query: string;
  timestamp: number;
  timeRange?: TimeRange;
}

export interface QueryEditorProps {
  query: string;
  onQueryChange: (query: string) => void;
  onExecute: () => void;
  loading: boolean;
  suggestions: string[];
}

export interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

export interface ResultsViewerProps {
  results: VMQueryResult | null;
  loading: boolean;
  error: string | null;
}

export interface MetricsExplorerProps {
  metrics: string[];
  labels: string[];
  onMetricSelect: (metric: string) => void;
  onLabelSelect: (label: string) => void;
}

export interface ConfigModalProps {
  onClose: () => void;
  onConfigUpdate: (config: { selectNode: string; accountID: string; timeout: number }) => void;
} 