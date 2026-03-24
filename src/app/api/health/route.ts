import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import log from '@/lib/logger';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 * Returns the health status of the application and its dependencies
 */
export async function GET() {
  const startTime = Date.now();

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: { status: 'unknown', responseTime: 0 },
      memory: { status: 'unknown', usage: {} },
    },
  };

  try {
    // Check database connectivity
    const dbStart = Date.now();
    const pool = getPool();
    await pool.query('SELECT 1');
    const dbDuration = Date.now() - dbStart;

    health.checks.database = {
      status: dbDuration < 100 ? 'healthy' : 'degraded',
      responseTime: dbDuration,
    };
  } catch (error) {
    log.error('Health check: Database check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    health.status = 'unhealthy';
    health.checks.database = {
      status: 'unhealthy',
      responseTime: 0,
    };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  // Flag if heap usage is over 90%
  const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  health.checks.memory = {
    status: heapUsagePercent > 90 ? 'degraded' : 'healthy',
    usage: memUsageMB,
  };

  // Overall status
  const allChecksHealthy = Object.values(health.checks).every(
    (check: any) => check.status === 'healthy'
  );
  const anyCheckUnhealthy = Object.values(health.checks).some(
    (check: any) => check.status === 'unhealthy'
  );

  if (anyCheckUnhealthy) {
    health.status = 'unhealthy';
  } else if (!allChecksHealthy) {
    health.status = 'degraded';
  }

  const responseTime = Date.now() - startTime;

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(
    {
      ...health,
      responseTime,
    },
    { status: statusCode }
  );
}
