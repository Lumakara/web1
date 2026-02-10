/**
 * Pterodactyl Panel API Integration Service
 * 
 * This module provides a comprehensive interface for managing Pterodactyl Panel
 * servers and users through the Application API.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PterodactylServer {
  id: string;
  uuid: string;
  identifier: string;
  external_id: string | null;
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
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  user: string;
  node: string;
  allocation: string;
  nest: string;
  egg: string;
  container: {
    startup_command: string;
    image: string;
    installed: boolean;
    environment: Record<string, string>;
  };
  updated_at: string;
  created_at: string;
}

export interface PterodactylUser {
  id: string;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  root_admin: boolean;
  two_factor: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServerPackage {
  name: string;
  cpu: number;
  memory: number;
  disk: number;
  swap: number;
  io: number;
  databases: number;
  allocations: number;
  backups: number;
}

export interface CreateServerRequest {
  name: string;
  user: string;
  egg: string;
  docker_image?: string;
  startup: string;
  environment?: Record<string, string>;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
  };
  feature_limits?: {
    databases: number;
    allocations: number;
    backups: number;
  };
  allocation?: {
    default?: number;
    additional?: number[];
  };
  external_id?: string;
  description?: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password?: string;
  root_admin?: boolean;
  language?: string;
}

export interface ServerStatus {
  state: 'on' | 'off' | 'starting' | 'stopping';
  memory_bytes: number;
  cpu_absolute: number;
  disk_bytes: number;
  network: {
    rx_bytes: number;
    tx_bytes: number;
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
    };
  };
}

export interface PterodactylApiListResponse<T> {
  object: string;
  data: T[];
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export interface CreatePterodactylServerOptions {
  userId: string;
  username: string;
  email: string;
  password: string;
  package: '5gb' | '10gb' | 'unlimited';
  serverName: string;
  eggId: string;
  dockerImage?: string;
  startupCommand?: string;
  externalId?: string;
}

export interface PterodactylApiError extends Error {
  statusCode: number;
  responseBody?: unknown;
}

// ============================================================================
// Configuration
// ============================================================================

const PANEL_URL = import.meta.env.VITE_PTERODACTYL_PANEL_URL?.replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_PTERODACTYL_API_KEY; // PTLA token
const CLIENT_API_KEY = import.meta.env.VITE_PTERODACTYL_CLIENT_API_KEY; // PTLC token

const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

// ============================================================================
// Package Configurations
// ============================================================================

export const SERVER_PACKAGES: Record<string, ServerPackage> = {
  '5gb': {
    name: '5GB Package',
    cpu: 100,      // 100% = 1 CPU core
    memory: 2048,  // 2GB in MB
    disk: 5120,    // 5GB in MB
    swap: 0,
    io: 500,
    databases: 1,
    allocations: 1,
    backups: 1,
  },
  '10gb': {
    name: '10GB Package',
    cpu: 200,      // 200% = 2 CPU cores
    memory: 4096,  // 4GB in MB
    disk: 10240,   // 10GB in MB
    swap: 0,
    io: 500,
    databases: 2,
    allocations: 2,
    backups: 2,
  },
  'unlimited': {
    name: 'Unlimited Package',
    cpu: 400,      // 400% = 4 CPU cores
    memory: 8192,  // 8GB in MB
    disk: 51200,   // 50GB in MB
    swap: 0,
    io: 500,
    databases: 5,
    allocations: 5,
    backups: 5,
  },
};

// ============================================================================
// Error Handling
// ============================================================================

class PterodactylApiErrorImpl extends Error implements PterodactylApiError {
  statusCode: number;
  responseBody?: unknown;

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message);
    this.name = 'PterodactylApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

function createError(message: string, statusCode: number, responseBody?: unknown): PterodactylApiError {
  return new PterodactylApiErrorImpl(message, statusCode, responseBody);
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Get the base headers for API requests
 */
function getHeaders(): Record<string, string> {
  if (!API_KEY) {
    throw createError('Pterodactyl API key (PTLA) is not configured', 500);
  }

  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/vnd.pterodactyl.v1+json',
    'Content-Type': 'application/json',
  };
}

/**
 * Get the base headers for Client API requests
 */
function getClientHeaders(): Record<string, string> {
  if (!CLIENT_API_KEY) {
    throw createError('Pterodactyl Client API key (PTLC) is not configured', 500);
  }

  return {
    'Authorization': `Bearer ${CLIENT_API_KEY}`,
    'Accept': 'application/vnd.pterodactyl.v1+json',
    'Content-Type': 'application/json',
  };
}

/**
 * Make an API request with retry logic
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  useClientApi: boolean = false,
  retries: number = DEFAULT_RETRIES
): Promise<T> {
  if (!PANEL_URL) {
    throw createError('Pterodactyl Panel URL is not configured', 500);
  }

  const url = `${PANEL_URL}/api${endpoint}`;
  const headers = useClientApi ? getClientHeaders() : getHeaders();

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw createError(
          `Pterodactyl API error: ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json() as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof PterodactylApiErrorImpl && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Retry on network errors or 5xx errors
      if (attempt < retries) {
        const delay = DEFAULT_RETRY_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || createError('Unknown error occurred', 500);
}

// ============================================================================
// Server Management
// ============================================================================

/**
 * Create a new game server
 */
export async function createServer(
  serverData: CreateServerRequest
): Promise<PterodactylApiResponse<PterodactylServer>> {
  return apiRequest<PterodactylApiResponse<PterodactylServer>>('/application/servers', {
    method: 'POST',
    body: JSON.stringify({
      name: serverData.name,
      user: serverData.user,
      egg: serverData.egg,
      docker_image: serverData.docker_image,
      startup: serverData.startup,
      environment: serverData.environment || {},
      limits: serverData.limits,
      feature_limits: serverData.feature_limits || {
        databases: 0,
        allocations: 0,
        backups: 0,
      },
      allocation: serverData.allocation,
      external_id: serverData.external_id,
      description: serverData.description,
    }),
  });
}

/**
 * Delete a server
 */
export async function deleteServer(serverId: string): Promise<void> {
  return apiRequest<void>(`/application/servers/${serverId}`, {
    method: 'DELETE',
  });
}

/**
 * Force delete a server (bypasses deletion confirmation)
 */
export async function forceDeleteServer(serverId: string): Promise<void> {
  return apiRequest<void>(`/application/servers/${serverId}/force`, {
    method: 'DELETE',
  });
}

/**
 * Suspend a server
 */
export async function suspendServer(serverId: string): Promise<void> {
  return apiRequest<void>(`/application/servers/${serverId}/suspend`, {
    method: 'POST',
  });
}

/**
 * Unsuspend a server
 */
export async function unsuspendServer(serverId: string): Promise<void> {
  return apiRequest<void>(`/application/servers/${serverId}/unsuspend`, {
    method: 'POST',
  });
}

/**
 * Reinstall a server
 */
export async function reinstallServer(serverId: string): Promise<void> {
  return apiRequest<void>(`/application/servers/${serverId}/reinstall`, {
    method: 'POST',
  });
}

/**
 * Get server details
 */
export async function getServerDetails(
  serverId: string
): Promise<PterodactylApiResponse<PterodactylServer>> {
  return apiRequest<PterodactylApiResponse<PterodactylServer>>(`/application/servers/${serverId}`);
}

/**
 * Get server status and resource usage (requires Client API)
 */
export async function getServerStatus(serverId: string): Promise<ServerStatus> {
  // This uses the Client API (PTLC token) to get real-time resource usage
  return apiRequest<ServerStatus>(`/client/servers/${serverId}/resources`, {}, true);
}

/**
 * List all servers with optional pagination
 */
export async function listServers(
  page: number = 1,
  perPage: number = 50
): Promise<PterodactylApiListResponse<PterodactylServer>> {
  return apiRequest<PterodactylApiListResponse<PterodactylServer>>(
    `/application/servers?page=${page}&per_page=${perPage}`
  );
}

/**
 * Update server details
 */
export async function updateServer(
  serverId: string,
  serverData: Partial<CreateServerRequest>
): Promise<PterodactylApiResponse<PterodactylServer>> {
  return apiRequest<PterodactylApiResponse<PterodactylServer>>(`/application/servers/${serverId}`, {
    method: 'PATCH',
    body: JSON.stringify(serverData),
  });
}

/**
 * Update server build configuration (limits, feature limits)
 */
export async function updateServerBuild(
  serverId: string,
  buildData: {
    allocation?: number;
    memory?: number;
    swap?: number;
    disk?: number;
    io?: number;
    cpu?: number;
    threads?: string | null;
    databases?: number;
    allocations?: number;
    backups?: number;
  }
): Promise<PterodactylApiResponse<PterodactylServer>> {
  return apiRequest<PterodactylApiResponse<PterodactylServer>>(`/application/servers/${serverId}/build`, {
    method: 'PATCH',
    body: JSON.stringify(buildData),
  });
}

/**
 * Update server startup configuration
 */
export async function updateServerStartup(
  serverId: string,
  startupData: {
    startup?: string;
    environment?: Record<string, string>;
    egg?: string;
    image?: string;
    skip_scripts?: boolean;
  }
): Promise<PterodactylApiResponse<PterodactylServer>> {
  return apiRequest<PterodactylApiResponse<PterodactylServer>>(`/application/servers/${serverId}/startup`, {
    method: 'PATCH',
    body: JSON.stringify(startupData),
  });
}

// ============================================================================
// User Management
// ============================================================================

/**
 * Create a new panel user
 */
export async function createUser(
  userData: CreateUserRequest
): Promise<PterodactylApiResponse<PterodactylUser>> {
  return apiRequest<PterodactylApiResponse<PterodactylUser>>('/application/users', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      password: userData.password,
      root_admin: userData.root_admin || false,
      language: userData.language || 'en',
    }),
  });
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<PterodactylApiResponse<PterodactylUser>> {
  return apiRequest<PterodactylApiResponse<PterodactylUser>>(`/application/users/${userId}`);
}

/**
 * Find a user by email address
 */
export async function getUserByEmail(
  email: string
): Promise<PterodactylUser | null> {
  const response = await apiRequest<PterodactylApiListResponse<PterodactylUser>>(
    `/application/users?filter[email]=${encodeURIComponent(email)}`
  );

  if (response.data && response.data.length > 0) {
    return response.data[0];
  }

  return null;
}

/**
 * List all users with optional pagination
 */
export async function listUsers(
  page: number = 1,
  perPage: number = 50
): Promise<PterodactylApiListResponse<PterodactylUser>> {
  return apiRequest<PterodactylApiListResponse<PterodactylUser>>(
    `/application/users?page=${page}&per_page=${perPage}`
  );
}

/**
 * Update a user
 */
export async function updateUser(
  userId: string,
  userData: Partial<CreateUserRequest>
): Promise<PterodactylApiResponse<PterodactylUser>> {
  return apiRequest<PterodactylApiResponse<PterodactylUser>>(`/application/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  return apiRequest<void>(`/application/users/${userId}`, {
    method: 'DELETE',
  });
}

/**
 * Reset a user's password
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<PterodactylApiResponse<PterodactylUser>> {
  return updateUser(userId, { password: newPassword });
}

// ============================================================================
// Server Creation for Products
// ============================================================================

/**
 * Create a Pterodactyl server for a product package
 * 
 * This function handles the complete workflow of creating a server
 * including user lookup/creation and applying the correct package limits.
 */
export async function createPterodactylServer(
  options: CreatePterodactylServerOptions
): Promise<{
  success: boolean;
  server?: PterodactylServer;
  user?: PterodactylUser;
  error?: string;
}> {
  try {
    // Validate package
    const packageConfig = SERVER_PACKAGES[options.package];
    if (!packageConfig) {
      return {
        success: false,
        error: `Invalid package: ${options.package}. Available packages: ${Object.keys(SERVER_PACKAGES).join(', ')}`,
      };
    }

    // Check if user already exists
    let user = await getUserByEmail(options.email);

    // Create user if not exists
    if (!user) {
      const [firstName, lastName] = options.username.split(' ');
      const userResponse = await createUser({
        email: options.email,
        username: options.username,
        first_name: firstName || options.username,
        last_name: lastName || 'User',
        password: options.password,
        root_admin: false,
        language: 'en',
      });
      user = userResponse.data;
    }

    // Create server with package limits
    const serverResponse = await createServer({
      name: options.serverName,
      user: user.id,
      egg: options.eggId,
      docker_image: options.dockerImage,
      startup: options.startupCommand || '',
      external_id: options.externalId,
      limits: {
        memory: packageConfig.memory,
        swap: packageConfig.swap,
        disk: packageConfig.disk,
        io: packageConfig.io,
        cpu: packageConfig.cpu,
      },
      feature_limits: {
        databases: packageConfig.databases,
        allocations: packageConfig.allocations,
        backups: packageConfig.backups,
      },
    });

    return {
      success: true,
      server: serverResponse.data,
      user,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if the Pterodactyl API is configured and accessible
 */
export async function checkApiConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    if (!PANEL_URL) {
      return {
        connected: false,
        message: 'Pterodactyl Panel URL is not configured (VITE_PTERODACTYL_PANEL_URL)',
      };
    }

    if (!API_KEY) {
      return {
        connected: false,
        message: 'Pterodactyl API key is not configured (VITE_PTERODACTYL_API_KEY)',
      };
    }

    // Try to list users to verify connection
    await listUsers(1, 1);

    return {
      connected: true,
      message: 'Successfully connected to Pterodactyl Panel API',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      connected: false,
      message: `Failed to connect to Pterodactyl API: ${errorMessage}`,
    };
  }
}

/**
 * Get package configuration by name
 */
export function getPackageConfig(packageName: string): ServerPackage | null {
  return SERVER_PACKAGES[packageName] || null;
}

/**
 * List available package configurations
 */
export function listAvailablePackages(): ServerPackage[] {
  return Object.values(SERVER_PACKAGES);
}

// ============================================================================
// Export Default
// ============================================================================

export default {
  // Server Management
  createServer,
  deleteServer,
  forceDeleteServer,
  suspendServer,
  unsuspendServer,
  reinstallServer,
  getServerDetails,
  getServerStatus,
  listServers,
  updateServer,
  updateServerBuild,
  updateServerStartup,

  // User Management
  createUser,
  getUser,
  getUserByEmail,
  listUsers,
  updateUser,
  deleteUser,
  resetUserPassword,

  // Product Server Creation
  createPterodactylServer,

  // Utilities
  checkApiConnection,
  getPackageConfig,
  listAvailablePackages,

  // Constants
  SERVER_PACKAGES,
};
