'use client';

import { useEffect, useState } from 'react';
import {
  AnalyticsMetrics,
  ActivityInsights,
} from '@/types';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [insights, setInsights] = useState<ActivityInsights | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);

  useEffect(() => {
    fetchMetrics();
    fetchInsights();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/admin/analytics/insights?days=30');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setAiAvailable(false);
          setInsightsError(data.message || 'AI analysis not available');
        } else {
          throw new Error('Failed to fetch insights');
        }
      } else {
        setInsights(data.insights);
        setAiAvailable(data.ai_available);
      }
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loadingMetrics && loadingInsights) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-900 dark:text-red-100">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Section */}
      {metrics && (
        <>
          {/* Issue Metrics */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Issue Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Issues"
                value={metrics.issue_metrics.total_issues}
                icon="📊"
              />
              <MetricCard
                title="Open Issues"
                value={metrics.issue_metrics.open_issues}
                icon="📂"
                color="blue"
              />
              <MetricCard
                title="In Progress"
                value={metrics.issue_metrics.in_progress_issues}
                icon="⚡"
                color="yellow"
              />
              <MetricCard
                title="Overdue"
                value={metrics.issue_metrics.overdue_issues}
                icon="⚠️"
                color="red"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Issues by Priority
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics.issue_metrics.issues_by_priority).map(
                    ([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="capitalize text-gray-700 dark:text-gray-300">
                          {priority}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Issues by Type
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics.issue_metrics.issues_by_type).map(
                    ([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize text-gray-700 dark:text-gray-300">
                          {type}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="Avg Resolution Time"
                value={`${metrics.issue_metrics.average_resolution_time_hours.toFixed(1)}h`}
                icon="⏱️"
              />
              <MetricCard
                title="Issue Velocity"
                value={`${metrics.issue_metrics.issue_velocity.toFixed(1)}/day`}
                icon="🚀"
              />
            </div>
          </section>

          {/* User Metrics */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              User Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Total Users"
                value={metrics.user_metrics.total_users}
                icon="👥"
              />
              <MetricCard
                title="Active (7 days)"
                value={metrics.user_metrics.active_users_last_7_days}
                icon="🔥"
                color="green"
              />
              <MetricCard
                title="Active (30 days)"
                value={metrics.user_metrics.active_users_last_30_days}
                icon="📈"
                color="blue"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Most Active Users
                </h3>
                <div className="space-y-3">
                  {metrics.user_metrics.most_active_users.slice(0, 5).map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.user_name}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.action_count} actions
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Resolvers
                </h3>
                <div className="space-y-3">
                  {metrics.user_metrics.top_resolvers.slice(0, 5).map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.user_name}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.resolved_count} resolved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Project Metrics */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Project Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Total Projects"
                value={metrics.project_metrics.total_projects}
                icon="📁"
              />
              <MetricCard
                title="Active Projects"
                value={metrics.project_metrics.active_projects}
                icon="✅"
                color="green"
              />
              <MetricCard
                title="Projects with Overdue"
                value={metrics.project_metrics.projects_with_overdue_issues}
                icon="⚠️"
                color="red"
              />
            </div>

            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Health Scores
              </h3>
              <div className="space-y-3">
                {metrics.project_metrics.project_health_scores.slice(0, 10).map((project) => (
                  <div key={project.project_id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {project.project_name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {project.health_score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.health_score >= 80
                              ? 'bg-green-500'
                              : project.health_score >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${project.health_score}%` }}
                        ></div>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        <span>{project.open_issues} open</span>
                        <span>{project.overdue_issues} overdue</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* AI Insights Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🤖 AI-Powered Insights
        </h2>

        {!aiAvailable && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              AI Analysis Not Available
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {insightsError ||
                'Configure ANTHROPIC_API_KEY environment variable to enable AI-powered insights.'}
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              With AI analysis, you&apos;ll get:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 mt-2 space-y-1">
              <li>Automated pattern detection</li>
              <li>Predictive analytics for overdue issues</li>
              <li>Personalized recommendations</li>
              <li>Bottleneck identification</li>
            </ul>
          </div>
        )}

        {insights && (
          <div className="space-y-6">
            {/* Recommendations */}
            {insights.recommendations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  💡 Recommendations
                </h3>
                <div className="space-y-4">
                  {insights.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-primary-500 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            rec.priority === 'high'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        {rec.description}
                      </p>
                      {rec.action_items.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {rec.action_items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patterns */}
            {insights.patterns.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔍 Activity Patterns
                </h3>
                <div className="space-y-3">
                  {insights.patterns.map((pattern, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-2xl">
                        {pattern.impact === 'high' ? '🔴' : pattern.impact === 'medium' ? '🟡' : '🟢'}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {pattern.pattern_type}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {pattern.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            {insights.predictions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔮 Predictions
                </h3>
                <div className="space-y-3">
                  {insights.predictions.map((pred, index) => (
                    <div
                      key={index}
                      className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {pred.prediction_type}
                        </h4>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {pred.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {pred.description}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Timeframe: {pred.timeframe}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

function MetricCard({ title, value, icon, color = 'gray' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    gray: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  };

  return (
    <div className={`rounded-lg border p-6 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
    </div>
  );
}
