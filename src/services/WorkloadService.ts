import { issueRepository, userRepository } from '@/repositories';
import { User, IssueStatus } from '@/types';

export interface UserWorkload {
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  total_issues: number;
  open_issues: number;
  in_progress_issues: number;
  overdue_issues: number;
  workload_score: number; // Weighted score for "best available"
}

export interface WorkloadSummary {
  total_users: number;
  users_with_issues: number;
  average_workload: number;
  most_loaded_user: UserWorkload | null;
  least_loaded_user: UserWorkload | null;
  best_available_user: UserWorkload | null;
}

/**
 * Service for calculating and managing user workloads
 */
export class WorkloadService {
  /**
   * Calculate workload for a specific user
   */
  async getUserWorkload(userId: string): Promise<UserWorkload | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    const issues = await issueRepository.findByAssigneeId(userId);

    const now = new Date();
    const openIssues = issues.filter(i => i.status === IssueStatus.OPEN).length;
    const inProgressIssues = issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length;
    const overdueIssues = issues.filter(i =>
      i.due_date &&
      new Date(i.due_date) < now &&
      i.status !== IssueStatus.CLOSED &&
      i.status !== IssueStatus.RESOLVED
    ).length;

    // Calculate workload score (higher = more loaded)
    // Weight: open=1, in_progress=2, overdue=5
    const workloadScore = (openIssues * 1) + (inProgressIssues * 2) + (overdueIssues * 5);

    return {
      user_id: userId,
      user_name: user.name,
      user_email: user.email,
      user_role: user.role,
      total_issues: issues.length,
      open_issues: openIssues,
      in_progress_issues: inProgressIssues,
      overdue_issues: overdueIssues,
      workload_score: workloadScore,
    };
  }

  /**
   * Get workload for all users
   */
  async getAllUserWorkloads(): Promise<UserWorkload[]> {
    const users = await userRepository.findAll();
    const workloads = await Promise.all(
      users.map(user => this.getUserWorkload(user.id))
    );

    return workloads.filter((w): w is UserWorkload => w !== null);
  }

  /**
   * Get workload summary statistics
   */
  async getWorkloadSummary(): Promise<WorkloadSummary> {
    const workloads = await this.getAllUserWorkloads();

    if (workloads.length === 0) {
      return {
        total_users: 0,
        users_with_issues: 0,
        average_workload: 0,
        most_loaded_user: null,
        least_loaded_user: null,
        best_available_user: null,
      };
    }

    const usersWithIssues = workloads.filter(w => w.total_issues > 0);
    const totalWorkload = workloads.reduce((sum, w) => sum + w.workload_score, 0);
    const avgWorkload = totalWorkload / workloads.length;

    // Find most and least loaded users (excluding users with 0 issues for "least")
    const sortedByWorkload = [...workloads].sort((a, b) => b.workload_score - a.workload_score);
    const mostLoaded = sortedByWorkload[0] || null;

    // Least loaded: prefer users with some capacity but not completely empty
    const usersWithCapacity = workloads.filter(w => w.workload_score < 10); // Threshold for "available"
    const leastLoaded = usersWithCapacity.sort((a, b) => a.workload_score - b.workload_score)[0] || workloads[workloads.length - 1];

    // Best available: lowest workload score among developers/managers (not viewers)
    const availableUsers = workloads.filter(w =>
      w.user_role !== 'viewer' && w.workload_score < 15 // Reasonable capacity threshold
    ).sort((a, b) => a.workload_score - b.workload_score);
    const bestAvailable = availableUsers[0] || null;

    return {
      total_users: workloads.length,
      users_with_issues: usersWithIssues.length,
      average_workload: avgWorkload,
      most_loaded_user: mostLoaded,
      least_loaded_user: leastLoaded,
      best_available_user: bestAvailable,
    };
  }

  /**
   * Get best user to assign new issue to
   * Returns user with lowest workload who can accept assignments
   */
  async getBestAvailableUser(excludeUserId?: string): Promise<UserWorkload | null> {
    const workloads = await this.getAllUserWorkloads();

    // Filter out viewers and optionally exclude a specific user
    const eligibleUsers = workloads.filter(w =>
      w.user_role !== 'viewer' &&
      (!excludeUserId || w.user_id !== excludeUserId)
    );

    if (eligibleUsers.length === 0) return null;

    // Sort by workload score (ascending) and return first
    return eligibleUsers.sort((a, b) => a.workload_score - b.workload_score)[0];
  }

  /**
   * Check if user is overloaded
   */
  async isUserOverloaded(userId: string, threshold: number = 15): Promise<boolean> {
    const workload = await this.getUserWorkload(userId);
    if (!workload) return false;

    return workload.workload_score > threshold;
  }

  /**
   * Get users who are overloaded
   */
  async getOverloadedUsers(threshold: number = 15): Promise<UserWorkload[]> {
    const workloads = await this.getAllUserWorkloads();
    return workloads.filter(w => w.workload_score > threshold);
  }

  /**
   * Get workload distribution for analytics
   */
  async getWorkloadDistribution(): Promise<{
    underutilized: UserWorkload[];  // score 0-5
    balanced: UserWorkload[];        // score 6-15
    busy: UserWorkload[];            // score 16-25
    overloaded: UserWorkload[];      // score 26+
  }> {
    const workloads = await this.getAllUserWorkloads();

    return {
      underutilized: workloads.filter(w => w.workload_score <= 5),
      balanced: workloads.filter(w => w.workload_score > 5 && w.workload_score <= 15),
      busy: workloads.filter(w => w.workload_score > 15 && w.workload_score <= 25),
      overloaded: workloads.filter(w => w.workload_score > 25),
    };
  }
}

// Export singleton instance
export const workloadService = new WorkloadService();
