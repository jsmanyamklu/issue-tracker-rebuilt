'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

interface WorkloadSummary {
  total_users: number;
  users_with_issues: number;
  average_workload: number;
  most_loaded_user: {
    user_name: string;
    total_issues: number;
    workload_score: number;
  } | null;
  least_loaded_user: {
    user_name: string;
    total_issues: number;
    workload_score: number;
  } | null;
  best_available_user: {
    user_name: string;
    total_issues: number;
    workload_score: number;
  } | null;
}

interface WorkloadDistribution {
  underutilized: any[];
  balanced: any[];
  busy: any[];
  overloaded: any[];
}

export default function AssignmentWidget() {
  const [summary, setSummary] = useState<WorkloadSummary | null>(null);
  const [distribution, setDistribution] = useState<WorkloadDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, distributionRes] = await Promise.all([
        fetch('/api/workload?action=summary'),
        fetch('/api/workload?action=distribution'),
      ]);

      const summaryData = await summaryRes.json();
      const distributionData = await distributionRes.json();

      if (summaryData.success) {
        setSummary(summaryData.data);
      }
      if (distributionData.success) {
        setDistribution(distributionData.data);
      }
    } catch (error) {
      console.error('Failed to fetch workload data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || !distribution) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Workload Distribution</CardTitle>
          <Link
            href="/analytics/assignments"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            View Details →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Team Members
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.total_users}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {summary.users_with_issues} with assignments
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Avg. Workload
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.average_workload.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              score per person
            </div>
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Distribution
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="flex h-full">
                  {distribution.underutilized.length > 0 && (
                    <div
                      className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        width: `${
                          (distribution.underutilized.length / summary.total_users) * 100
                        }%`,
                      }}
                      title={`Available: ${distribution.underutilized.length}`}
                    >
                      {distribution.underutilized.length > 0 && distribution.underutilized.length}
                    </div>
                  )}
                  {distribution.balanced.length > 0 && (
                    <div
                      className="bg-yellow-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        width: `${(distribution.balanced.length / summary.total_users) * 100}%`,
                      }}
                      title={`Balanced: ${distribution.balanced.length}`}
                    >
                      {distribution.balanced.length > 0 && distribution.balanced.length}
                    </div>
                  )}
                  {distribution.busy.length > 0 && (
                    <div
                      className="bg-orange-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        width: `${(distribution.busy.length / summary.total_users) * 100}%`,
                      }}
                      title={`Busy: ${distribution.busy.length}`}
                    >
                      {distribution.busy.length > 0 && distribution.busy.length}
                    </div>
                  )}
                  {distribution.overloaded.length > 0 && (
                    <div
                      className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{
                        width: `${(distribution.overloaded.length / summary.total_users) * 100}%`,
                      }}
                      title={`Overloaded: ${distribution.overloaded.length}`}
                    >
                      {distribution.overloaded.length > 0 && distribution.overloaded.length}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-600 dark:text-gray-400">
                  Available ({distribution.underutilized.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-600 dark:text-gray-400">
                  Balanced ({distribution.balanced.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                <span className="text-gray-600 dark:text-gray-400">
                  Busy ({distribution.busy.length})
                </span>
              </div>
              {distribution.overloaded.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Overloaded ({distribution.overloaded.length})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key People */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {summary.best_available_user && (
            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  🎯 Best Available
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {summary.best_available_user.user_name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {summary.best_available_user.total_issues} issues
                </div>
              </div>
            </div>
          )}

          {distribution.overloaded.length > 0 && summary.most_loaded_user && (
            <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ⚠️ Most Loaded
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {summary.most_loaded_user.user_name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {summary.most_loaded_user.total_issues} issues
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Alert */}
        {distribution.overloaded.length > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
              ⚠️ Rebalancing Recommended
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400">
              {distribution.overloaded.length} team member{distribution.overloaded.length > 1 ? 's are' : ' is'} overloaded. Consider reassigning issues.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
