import axios, { type AxiosInstance } from 'axios';

// Types for Elasticsearch responses
export interface ElasticsearchClusterHealth {
  cluster_name: string;
  status: 'green' | 'yellow' | 'red';
  timed_out: boolean;
  number_of_nodes: number;
  number_of_data_nodes: number;
  active_primary_shards: number;
  active_shards: number;
  relocating_shards: number;
  initializing_shards: number;
  unassigned_shards: number;
  delayed_unassigned_shards: number;
  number_of_pending_tasks: number;
  number_of_in_flight_fetch: number;
  task_max_waiting_in_queue_millis: number;
  active_shards_percent_as_number: number;
}

export interface ElasticsearchIndex {
  health: 'green' | 'yellow' | 'red';
  status: 'open' | 'close';
  index: string;
  uuid: string;
  pri: string;
  rep: string;
  'docs.count': string;
  'docs.deleted': string;
  'store.size': string;
  'pri.store.size': string;
}

export interface ElasticsearchIndexMapping {
  [index: string]: {
    mappings: {
      properties: Record<string, any>;
    };
    settings: {
      index: Record<string, any>;
    };
  };
}

export interface ElasticsearchDocument {
  _index: string;
  _type?: string;
  _id: string;
  _score?: number;
  _source: Record<string, any>;
}

export interface SearchResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number | null;
    hits: ElasticsearchDocument[];
  };
}

export interface ElasticsearchStats {
  _nodes: {
    total: number;
    successful: number;
    failed: number;
  };
  cluster_name: string;
  nodes: Record<string, any>;
}

class ElasticsearchService {
  private client: AxiosInstance;

  constructor() {
    const node = import.meta.env.VITE_ELASTIC_NODE;
    const username = import.meta.env.VITE_ELASTIC_USERNAME;
    const password = import.meta.env.VITE_ELASTIC_PASSWORD;

    if (!node || !username || !password) {
      throw new Error('Elasticsearch configuration is missing. Please check your environment variables.');
    }

    // Create axios instance with custom config
    const axiosConfig: any = {
      baseURL: node,
      auth: {
        username,
        password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Handle SSL certificate rejection for development
    if (import.meta.env.VITE_ELASTIC_REJECT_UNAUTHORIZED === 'false') {
      // For browser environments, we'll handle SSL errors differently
      // Note: In a browser environment, we can't directly control SSL verification
      // The browser will show a warning that the user needs to accept
      axiosConfig.validateStatus = (status: number) => {
        // Accept any status code to avoid SSL errors blocking requests
        return true;
      };
    }

    // Development mode: Use proxy or HTTP if specified
    if (import.meta.env.DEV) {
      if (import.meta.env.VITE_ELASTIC_USE_HTTP === 'true') {
        axiosConfig.baseURL = axiosConfig.baseURL.replace('https://', 'http://');
      } else {
        // Use Vite dev server proxy to handle SSL issues
        axiosConfig.baseURL = '/elasticsearch';
      }
    }

    this.client = axios.create(axiosConfig);

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Check if response has error status
        if (response.status >= 400) {
          const error = new Error(`Elasticsearch error: ${response.statusText}`);
          (error as any).response = response;
          return Promise.reject(error);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          console.error('Elasticsearch error:', error.response.data);
        } else if (error.request) {
          console.error('Network error:', error.message);
          // Special handling for SSL errors
          if (error.message.includes('ERR_CERT_AUTHORITY_INVALID') || 
              error.message.includes('CERT_HAS_EXPIRED') ||
              error.message.includes('ERR_CERT_COMMON_NAME_INVALID')) {
            console.error('SSL Certificate Error: Please ensure your browser trusts the Elasticsearch certificate.');
            console.error('Solutions:');
            console.error('1. Visit', node, 'directly in your browser and accept the certificate');
            console.error('2. Set VITE_ELASTIC_USE_HTTP=true in your .env file to use HTTP (development only)');
            console.error('3. Configure a proper SSL certificate for your Elasticsearch instance');
          }
        } else {
          console.error('Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Cluster health
  async getClusterHealth(): Promise<ElasticsearchClusterHealth> {
    const response = await this.client.get('/_cluster/health');
    return response.data;
  }

  // Get all indexes
  async getIndexes(): Promise<ElasticsearchIndex[]> {
    const response = await this.client.get('/_cat/indices?format=json');
    return response.data;
  }

  // Get index mapping and settings
  async getIndexMapping(indexName: string): Promise<ElasticsearchIndexMapping> {
    const response = await this.client.get(`/${indexName}`);
    return response.data;
  }

  // Search documents in an index
  async searchDocuments(
    indexName: string,
    query?: any,
    from = 0,
    size = 10
  ): Promise<SearchResponse> {
    const body = query || { query: { match_all: {} } };
    const response = await this.client.post(`/${indexName}/_search`, {
      ...body,
      from,
      size,
    });
    return response.data;
  }

  // Get a specific document
  async getDocument(indexName: string, documentId: string): Promise<ElasticsearchDocument> {
    const response = await this.client.get(`/${indexName}/_doc/${documentId}`);
    return response.data;
  }

  // Get cluster stats
  async getClusterStats(): Promise<ElasticsearchStats> {
    const response = await this.client.get('/_nodes/stats');
    return response.data;
  }

  // Get index stats
  async getIndexStats(indexName: string): Promise<any> {
    const response = await this.client.get(`/${indexName}/_stats`);
    return response.data;
  }

  // Count documents in an index
  async countDocuments(indexName: string, query?: any): Promise<number> {
    const body = query || { query: { match_all: {} } };
    const response = await this.client.post(`/${indexName}/_count`, body);
    return response.data.count;
  }

  // Get cluster info
  async getClusterInfo(): Promise<any> {
    const response = await this.client.get('/');
    return response.data;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getClusterInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const elasticsearchService = new ElasticsearchService();