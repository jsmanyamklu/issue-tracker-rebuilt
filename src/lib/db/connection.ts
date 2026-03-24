import { Pool, PoolClient } from 'pg';
import log from '@/lib/logger';

// Singleton pool instance
let pool: Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20, // Maximum number of connections in the pool
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Throw error if connection takes more than 2 seconds
    });

    // Log pool errors
    pool.on('error', (err) => {
      log.error('Unexpected error on idle database client', { error: err.message, stack: err.stack });
    });

    log.info('PostgreSQL connection pool created');
  }

  return pool;
}

/**
 * Execute a query with automatic connection handling
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms)
    if (duration > 100) {
      log.warn('Slow query detected', {
        duration: `${duration}ms`,
        query: text.substring(0, 200), // First 200 chars to avoid logging too much
        params: params ? JSON.stringify(params).substring(0, 100) : undefined,
      });
    }

    // Log all queries in debug mode
    if (process.env.LOG_QUERIES === 'true') {
      log.query(text, duration);
    }

    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    log.error('Database query error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: text.substring(0, 200),
      params: params ? JSON.stringify(params).substring(0, 100) : undefined,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Execute a function within a database transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the connection pool (useful for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    log.info('PostgreSQL connection pool closed');
  }
}
