import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import log from '@/lib/logger';

/**
 * GET /api/metrics
 * Application metrics endpoint for monitoring
 * Returns various application metrics
 */
export async function GET() {
  try {
    // Gather metrics in parallel
    const [
      usersCount,
      projectsCount,
      issuesCount,
      issuesOpen,
      issuesInProgress,
      issuesResolved,
      issuesClosed,
      commentCount,
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM projects'),
      query('SELECT COUNT(*) as count FROM issues'),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'open'"),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'"),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'"),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'closed'"),
      query('SELECT COUNT(*) as count FROM comments'),
    ]);

    // Process metrics
    const memUsage = process.memoryUsage();

    const metrics = {
      timestamp: new Date().toISOString(),

      // Application metrics
      application: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
      },

      // Database metrics
      database: {
        users: parseInt(usersCount.rows[0].count, 10),
        projects: parseInt(projectsCount.rows[0].count, 10),
        issues: {
          total: parseInt(issuesCount.rows[0].count, 10),
          open: parseInt(issuesOpen.rows[0].count, 10),
          inProgress: parseInt(issuesInProgress.rows[0].count, 10),
          resolved: parseInt(issuesResolved.rows[0].count, 10),
          closed: parseInt(issuesClosed.rows[0].count, 10),
        },
        comments: parseInt(commentCount.rows[0].count, 10),
      },

      // System metrics
      system: {
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024), // MB
          heapUsagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        },
        cpu: process.cpuUsage(),
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    log.error('Failed to gather metrics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to gather metrics',
      },
      { status: 500 }
    );
  }
}

/**
 * Prometheus-compatible metrics endpoint
 * Returns metrics in Prometheus text format
 */
export async function OPTIONS() {
  try {
    const [
      usersCount,
      projectsCount,
      issuesCount,
      issuesOpen,
      issuesInProgress,
      issuesResolved,
      issuesClosed,
      commentsCount,
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM projects'),
      query('SELECT COUNT(*) as count FROM issues'),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'open'"),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'"),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'"),
      query("SELECT COUNT(*) as count FROM issues WHERE status = 'closed'"),
      query('SELECT COUNT(*) as count FROM comments'),
    ]);

    const memUsage = process.memoryUsage();

    // Prometheus format
    const prometheusMetrics = `
# HELP issue_tracker_uptime_seconds Application uptime in seconds
# TYPE issue_tracker_uptime_seconds gauge
issue_tracker_uptime_seconds ${process.uptime()}

# HELP issue_tracker_users_total Total number of users
# TYPE issue_tracker_users_total gauge
issue_tracker_users_total ${usersCount.rows[0].count}

# HELP issue_tracker_projects_total Total number of projects
# TYPE issue_tracker_projects_total gauge
issue_tracker_projects_total ${projectsCount.rows[0].count}

# HELP issue_tracker_issues_total Total number of issues by status
# TYPE issue_tracker_issues_total gauge
issue_tracker_issues_total{status="open"} ${issuesOpen.rows[0].count}
issue_tracker_issues_total{status="in_progress"} ${issuesInProgress.rows[0].count}
issue_tracker_issues_total{status="resolved"} ${issuesResolved.rows[0].count}
issue_tracker_issues_total{status="closed"} ${issuesClosed.rows[0].count}

# HELP issue_tracker_comments_total Total number of comments
# TYPE issue_tracker_comments_total gauge
issue_tracker_comments_total ${commentsCount.rows[0].count}

# HELP issue_tracker_memory_usage_bytes Memory usage in bytes
# TYPE issue_tracker_memory_usage_bytes gauge
issue_tracker_memory_usage_bytes{type="rss"} ${memUsage.rss}
issue_tracker_memory_usage_bytes{type="heap_total"} ${memUsage.heapTotal}
issue_tracker_memory_usage_bytes{type="heap_used"} ${memUsage.heapUsed}
issue_tracker_memory_usage_bytes{type="external"} ${memUsage.external}
`.trim();

    return new Response(prometheusMetrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error) {
    log.error('Failed to generate Prometheus metrics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return new Response('# Error generating metrics', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
