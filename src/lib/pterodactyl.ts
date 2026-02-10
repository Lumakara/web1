/**
 * Pterodactyl Panel API Integration
 * 
 * This module provides integration with Pterodactyl Panel API
 * for managing game servers programmatically.
 */

// ============================================
// Configuration
// ============================================

const PTERODACTYL_API_URL = import.meta.env.VITE_PTERODACTYL_API_URL;
const PTERODACTYL_API_KEY = import.meta.env.VITE_PTERODACTYL_API_KEY; // ptla key (Application API)

// ============================================
// Package Configurations
// ============================================

export const PACKAGE_CONFIGS = {
  '5gb': {
    memory: 5120,  // 5GB in MB
    disk: 5120,    // 5GB in MB
    cpu: 100,      // 100% CPU
    swap: 0,
    io: 500,
    databases: 1,
    backups: 1,
    allocations: 1
  },
  '10gb': {
    memory: 10240, // 10GB in MB
    disk: 10240,   // 10GB in MB
    cpu: 200,      // 200% CPU
    swap: 0,
    io: 500,
    databases: 2,
    backups: 2,
    allocations: 1
  },
  'unlimited': {
    memory: 0,     // 0 = unlimited
    disk: 0,       // 0 = unlimited
    cpu: 0,        // 0 = unlimited
    swap: 0,
    io: 500,
    databases: 5,
    backups: 5,
    allocations: 2
  }
} as const;

export type PackageType = keyof typeof PACKAGE_CONFIGS;

// ============================================
// Type Definitions
// ============================================

export interface PterodactylServer {
  id: string;
  external_id: string | null;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  status: string;
  suspended: boolean;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads: number | null;
    oom_disabled: boolean;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  user: number;
  node: number;
  allocation: number;
  nest: number;
  egg: number;
  container: {
    startup_command: string;
    image: string;
    installed: boolean;
    environment: Record<string, string>;
  };
  updated_at: string;
  created_at: string;
}

export interface ServerConfig {
  name: string;
  userId: string;
  package: PackageType;
  eggId: number;
  nodeId: number;
  nestId?: number;
  description?: string;
  startup?: string;
  docker_image?: string;
  environment?: Record<string, string>;
  start_on_completion?: boolean;
}

export interface CreateServerRequest {
  name: string;
  user: number;
  egg: number;
  docker_image?: string;
  startup: string;
  environment?: Record<string, string>;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads?: number | null;
    oom_disabled?: boolean;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  allocation?: {
    default: number;
    additional?: number[];
  };
  deploy?: {
    locations: number[];
    dedicated_ip: boolean;
    port_range: string[];
  };
  start_on_completion?: boolean;
  skip_scripts?: boolean;
  oom_disabled?: boolean;
}

export interface PterodactylNode {
  id: number;
  uuid: string;
  public: boolean;
  name: string;
  description: string;
  location_id: number;
  fqdn: string;
  scheme: string;
  behind_proxy: boolean;
  maintenance_mode: boolean;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  daemon_listen: number;
  daemon_sftp: number;
  daemon_base: string;
  created_at: string;
  updated_at: string;
}

export interface PterodactylNest {
  id: number;
  uuid: string;
  author: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PterodactylEgg {
  id: number;
  uuid: string;
  name: string;
  nest: number;
  author: string;
  description: string | null;
  docker_image: string;
  docker_images: Record<string, string>;
  config: {
    files: Record<string, any>;
    startup: {
      done: string;
      userInteraction: string[];
    };
    stop: string;
    logs: {
      custom: boolean;
      location: string;
    };
    extends: string | null;
  };
  startup: string;
  script: {
    privileged: boolean;
    install: string;
    entry: string;
    container: string;
    extends: string | null;
  };
  created_at: string;
  updated_at: string;
  relationships?: {
    nest?: PterodactylNest;
    servers?: { object: string; data: PterodactylServer[] };
    variables?: { object: string; data: any[] };
  };
}

export interface PterodactylApiResponse<T> {
  object: string;
  data: T;
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: {
        previous?: string;
        next?: string;
      };
    };
  };
}

export interface PterodactylApiError {
  errors: Array<{
    code: string;
    status: string;
    detail: string;
    source?: {
      field?: string;
    };
  }>;
}

// ============================================
// Logging Utility
// ============================================

class Logger {
  private static prefix = '[PterodactylAPI]';

  static info(message: string, ...args: any[]): void {
    console.log(`${this.prefix} ℹ️ ${message}`, ...args);
  }

  static success(message: string, ...args: any[]): void {
    console.log(`${this.prefix} ✅ ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ❌ ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} ⚠️ ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (import.meta.env.DEV) {
      console.log(`${this.prefix} 🐛 ${message}`, ...args);
    }
  }
}

// ============================================
// Error Handling
// ============================================

export class PterodactylApiException extends Error {
  public readonly statusCode: number;
  public readonly errors: PterodactylApiError['errors'];

  constructor(message: string, statusCode: number, errors: PterodactylApiError['errors'] = []) {
    super(message);
    this.name = 'PterodactylApiException';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// ============================================
// API Client
// ============================================

class PterodactylApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PterodactylApiResponse<T>> {
    const url = `${this.baseUrl}/api/application${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    Logger.debug(`Making request to: ${url}`, { method: options.method || 'GET' });

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as PterodactylApiError;
        Logger.error(`API Error: ${response.status}`, errorData);
        throw new PterodactylApiException(
          errorData.errors?.[0]?.detail || `HTTP ${response.status}`,
          response.status,
          errorData.errors || []
        );
      }

      Logger.debug(`Request successful: ${url}`);
      return data as PterodactylApiResponse<T>;
    } catch (error) {
      if (error instanceof PterodactylApiException) {
        throw error;
      }
      Logger.error(`Network Error: ${(error as Error).message}`);
      throw new PterodactylApiException(
        `Network error: ${(error as Error).message}`,
        0
      );
    }
  }

  async get<T>(endpoint: string): Promise<PterodactylApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<PterodactylApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async patch<T>(endpoint: string, body: unknown): Promise<PterodactylApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  async delete<T>(endpoint: string): Promise<PterodactylApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// ============================================
// Service Class
// ============================================

class PterodactylServiceClass {
  private client: PterodactylApiClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    if (!PTERODACTYL_API_URL || !PTERODACTYL_API_KEY) {
      Logger.warn('Pterodactyl API credentials not configured');
      return;
    }

    this.client = new PterodactylApiClient(PTERODACTYL_API_URL, PTERODACTYL_API_KEY);
    Logger.info('Pterodactyl API client initialized');
  }

  private ensureClient(): PterodactylApiClient {
    if (!this.client) {
      throw new PterodactylApiException(
        'Pterodactyl API client not initialized. Check your environment variables.',
        500
      );
    }
    return this.client;
  }

  /**
   * Get list of nodes from the Pterodactyl Panel
   */
  async getNodes(): Promise<PterodactylNode[]> {
    Logger.info('Fetching nodes...');
    const client = this.ensureClient();
    
    try {
      const response = await client.get<PterodactylNode[]>('/nodes');
      const nodes = Array.isArray(response.data) ? response.data : [response.data];
      Logger.success(`Retrieved ${nodes.length} nodes`);
      return nodes;
    } catch (error) {
      Logger.error('Failed to fetch nodes', error);
      throw error;
    }
  }

  /**
   * Get list of nests from the Pterodactyl Panel
   */
  async getNests(): Promise<PterodactylNest[]> {
    Logger.info('Fetching nests...');
    const client = this.ensureClient();
    
    try {
      const response = await client.get<PterodactylNest[]>('/nests');
      const nests = Array.isArray(response.data) ? response.data : [response.data];
      Logger.success(`Retrieved ${nests.length} nests`);
      return nests;
    } catch (error) {
      Logger.error('Failed to fetch nests', error);
      throw error;
    }
  }

  /**
   * Get list of eggs for a specific nest
   * @param nestId - The ID of the nest
   */
  async getEggs(nestId: number): Promise<PterodactylEgg[]> {
    Logger.info(`Fetching eggs for nest ${nestId}...`);
    const client = this.ensureClient();
    
    try {
      const response = await client.get<PterodactylEgg[]>(`/nests/${nestId}/eggs`);
      const eggs = Array.isArray(response.data) ? response.data : [response.data];
      Logger.success(`Retrieved ${eggs.length} eggs for nest ${nestId}`);
      return eggs;
    } catch (error) {
      Logger.error(`Failed to fetch eggs for nest ${nestId}`, error);
      throw error;
    }
  }

  /**
   * Get egg details including variables
   * @param nestId - The ID of the nest
   * @param eggId - The ID of the egg
   */
  async getEggDetails(nestId: number, eggId: number): Promise<PterodactylEgg> {
    Logger.info(`Fetching egg details for nest ${nestId}, egg ${eggId}...`);
    const client = this.ensureClient();
    
    try {
      const response = await client.get<PterodactylEgg>(`/nests/${nestId}/eggs/${eggId}`);
      Logger.success(`Retrieved egg details for egg ${eggId}`);
      return response.data as unknown as PterodactylEgg;
    } catch (error) {
      Logger.error(`Failed to fetch egg details for egg ${eggId}`, error);
      throw error;
    }
  }

  /**
   * Create a new server
   * @param config - Server configuration
   */
  async createServer(config: ServerConfig): Promise<PterodactylServer> {
    Logger.info(`Creating server "${config.name}" for user ${config.userId}...`);
    const client = this.ensureClient();

    // Get package configuration
    const packageConfig = PACKAGE_CONFIGS[config.package];
    if (!packageConfig) {
      throw new PterodactylApiException(`Invalid package type: ${config.package}`, 400);
    }

    // Get egg details for default startup command and docker image
    let startupCommand = config.startup;
    let dockerImage = config.docker_image;
    
    if (!startupCommand || !dockerImage) {
      try {
        const nestId = config.nestId || 1;
        const eggDetails = await this.getEggDetails(nestId, config.eggId);
        startupCommand = startupCommand || eggDetails.startup;
        dockerImage = dockerImage || eggDetails.docker_image;
      } catch (error) {
        Logger.warn('Could not fetch egg details, using defaults');
        startupCommand = startupCommand || 'bash';
        dockerImage = dockerImage || 'alpine:latest';
      }
    }

    // Build the request payload
    const payload: CreateServerRequest = {
      name: config.name,
      user: parseInt(config.userId),
      egg: config.eggId,
      docker_image: dockerImage,
      startup: startupCommand,
      environment: config.environment || {},
      limits: {
        memory: packageConfig.memory,
        swap: packageConfig.swap,
        disk: packageConfig.disk,
        io: packageConfig.io,
        cpu: packageConfig.cpu,
        threads: null,
        oom_disabled: false
      },
      feature_limits: {
        databases: packageConfig.databases,
        allocations: packageConfig.allocations,
        backups: packageConfig.backups
      },
      deploy: {
        locations: [],
        dedicated_ip: false,
        port_range: []
      },
      start_on_completion: config.start_on_completion ?? true,
      skip_scripts: false
    };

    try {
      const response = await client.post<PterodactylServer>('/servers', payload);
      Logger.success(`Server created successfully: ${(response.data as unknown as PterodactylServer).identifier}`);
      return response.data as unknown as PterodactylServer;
    } catch (error) {
      Logger.error('Failed to create server', error);
      throw error;
    }
  }

  /**
   * Get server details
   * @param serverId - The server ID or UUID
   */
  async getServerDetails(serverId: string): Promise<PterodactylServer> {
    Logger.info(`Fetching server details for ${serverId}...`);
    const client = this.ensureClient();
    
    try {
      const response = await client.get<PterodactylServer>(`/servers/${serverId}`);
      Logger.success(`Retrieved server details for ${serverId}`);
      return response.data as unknown as PterodactylServer;
    } catch (error) {
      Logger.error(`Failed to fetch server details for ${serverId}`, error);
      throw error;
    }
  }

  /**
   * Get server details including node, user, and egg relationships
   * @param serverId - The server ID or UUID
   */
  async getServerDetailsWithRelations(serverId: string): Promise<PterodactylServer> {
    Logger.info(`Fetching server details with relations for ${serverId}...`);
    const client = this.ensureClient();
    
    try {
      const response = await client.get<PterodactylServer>(`/servers/${serverId}?include=node,user,egg`);
      Logger.success(`Retrieved server details with relations for ${serverId}`);
      return response.data as unknown as PterodactylServer;
    } catch (error) {
      Logger.error(`Failed to fetch server details with relations for ${serverId}`, error);
      throw error;
    }
  }

  /**
   * Delete a server
   * @param serverId - The server ID or UUID
   * @param force - Force delete (skip backup)
   */
  async deleteServer(serverId: string, force: boolean = false): Promise<void> {
    Logger.info(`Deleting server ${serverId}...`);
    const client = this.ensureClient();
    
    try {
      const endpoint = force 
        ? `/servers/${serverId}/force` 
        : `/servers/${serverId}`;
      await client.delete(endpoint);
      Logger.success(`Server ${serverId} deleted successfully`);
    } catch (error) {
      Logger.error(`Failed to delete server ${serverId}`, error);
      throw error;
    }
  }

  /**
   * Suspend a server
   * @param serverId - The server ID or UUID
   */
  async suspendServer(serverId: string): Promise<void> {
    Logger.info(`Suspending server ${serverId}...`);
    const client = this.ensureClient();
    
    try {
      await client.post(`/servers/${serverId}/suspend`, {});
      Logger.success(`Server ${serverId} suspended`);
    } catch (error) {
      Logger.error(`Failed to suspend server ${serverId}`, error);
      throw error;
    }
  }

  /**
   * Unsuspend a server
   * @param serverId - The server ID or UUID
   */
  async unsuspendServer(serverId: string): Promise<void> {
    Logger.info(`Unsuspending server ${serverId}...`);
    const client = this.ensureClient();
    
    try {
      await client.post(`/servers/${serverId}/unsuspend`, {});
      Logger.success(`Server ${serverId} unsuspended`);
    } catch (error) {
      Logger.error(`Failed to unsuspend server ${serverId}`, error);
      throw error;
    }
  }

  /**
   * Reinstall a server
   * @param serverId - The server ID or UUID
   */
  async reinstallServer(serverId: string): Promise<void> {
    Logger.info(`Reinstalling server ${serverId}...`);
    const client = this.ensureClient();
    
    try {
      await client.post(`/servers/${serverId}/reinstall`, {});
      Logger.success(`Server ${serverId} reinstall initiated`);
    } catch (error) {
      Logger.error(`Failed to reinstall server ${serverId}`, error);
      throw error;
    }
  }
}

// ============================================
// Export singleton instance
// ============================================

export const PterodactylService = new PterodactylServiceClass();

// Also export the class for custom instantiation
export { PterodactylServiceClass };

// Default export
export default PterodactylService;
