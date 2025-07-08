import axios, { AxiosInstance } from 'axios';
import { VMQueryResult, VMSeriesResult, VMLabelsResult, VMLabelValuesResult, TimeRange } from '../types';

const getDefaultSelectNode = () => {
  const envNode = import.meta.env.VITE_DEFAULT_SELECT_NODES;
  if (envNode) {
    return envNode.trim();
  }
  return 'http://localhost:8481';
};

const getDefaultAccountID = () => {
  const envAccount = import.meta.env.VITE_DEFAULT_ACCOUNT_ID;
  if (envAccount) {
    return envAccount.trim();
  }
  return '0';
};

const DEFAULT_CONFIG = {
  selectNode: getDefaultSelectNode(),
  accountID: getDefaultAccountID(),
  timeout: 30000
};

class VMApiService {
  private client: AxiosInstance;
  private config: typeof DEFAULT_CONFIG;

  constructor(config: Partial<typeof DEFAULT_CONFIG> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = axios.create({
      baseURL: `${this.config.selectNode}/select/${this.config.accountID}/prometheus`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  updateConfig(newConfig: Partial<typeof DEFAULT_CONFIG>) {
    this.config = { ...this.config, ...newConfig };
    this.client = axios.create({
      baseURL: `${this.config.selectNode}/select/${this.config.accountID}/prometheus`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  private async queryNode(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error querying vmselect:', error.message);
      throw error;
    }
  }

  async query(query: string, time?: string): Promise<VMQueryResult> {
    const params: Record<string, any> = { query };
    if (time) {
      params.time = time;
    }
    return this.queryNode('/api/v1/query', params);
  }

  async queryRange(query: string, timeRange: TimeRange): Promise<VMQueryResult> {
    const params = {
      query,
      start: timeRange.start,
      end: timeRange.end,
      step: timeRange.step
    };
    return this.queryNode('/api/v1/query_range', params);
  }

  async getSeries(match: string[] = []): Promise<VMSeriesResult> {
    const params: Record<string, any> = {};
    if (match.length > 0) {
      params.match = match;
    }
    return this.queryNode('/api/v1/series', params);
  }

  async getLabels(match: string[] = []): Promise<VMLabelsResult> {
    const params: Record<string, any> = {};
    if (match.length > 0) {
      params.match = match;
    }
    return this.queryNode('/api/v1/labels', params);
  }

  async getLabelValues(labelName: string, match: string[] = []): Promise<VMLabelValuesResult> {
    const params: Record<string, any> = {};
    if (match.length > 0) {
      params.match = match;
    }
    return this.queryNode(`/api/v1/label/${labelName}/values`, params);
  }

  async getMetrics(): Promise<string[]> {
    try {
      const series = await this.getSeries();
      const metrics = new Set<string>();
      if (series.data && Array.isArray(series.data)) {
        series.data.forEach(item => {
          if (item.__name__) {
            metrics.add(item.__name__);
          }
        });
      }
      return Array.from(metrics).sort();
    } catch (error) {
      console.error('Error getting metrics:', error);
      return [];
    }
  }

  async healthCheck(): Promise<{ node: string; status: string; error?: string }[]> {
    try {
      await this.client.get('/health');
      return [{ node: this.config.selectNode, status: 'healthy' }];
    } catch (error: any) {
      return [{ node: this.config.selectNode, status: 'unhealthy', error: error.message }];
    }
  }
}

export const vmApi = new VMApiService();
export default VMApiService; 