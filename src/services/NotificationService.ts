import { issueRepository, userRepository, projectRepository } from '@/repositories';
import { IssueWithRelations, UserRole } from '@/types';
import { notifyOverdueIssue, notifyManagerEscalation } from '@/lib/notifications/slack';

export interface OverdueIssue {
  issue: IssueWithRelations;
  days_overdue: number;
  assignee_notified: boolean;
  manager_escalated: boolean;
}

/**
 * Service for handling issue notifications and escalations
 */
export class NotificationService {
  /**
   * Get all overdue issues
   */
  async getOverdueIssues(): Promise<OverdueIssue[]> {
    const allIssues = await issueRepository.findAllWithRelations();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const overdueIssues = allIssues
      .filter(issue => {
        if (!issue.due_date) return false;
        if (issue.status === 'closed' || issue.status === 'resolved') return false;

        const dueDate = new Date(issue.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < now;
      })
      .map(issue => {
        const dueDate = new Date(issue.due_date!);
        dueDate.setHours(0, 0, 0, 0);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          issue,
          days_overdue: daysOverdue,
          assignee_notified: false, // TODO: Track in database
          manager_escalated: daysOverdue > 3, // Escalate after 3 days
        };
      });

    return overdueIssues.sort((a, b) => b.days_overdue - a.days_overdue);
  }

  /**
   * Send notifications for overdue issues
   */
  async notifyOverdueIssues(): Promise<{
    sent: number;
    escalated: number;
    errors: number;
  }> {
    const overdueIssues = await this.getOverdueIssues();
    let sent = 0;
    let escalated = 0;
    let errors = 0;

    for (const { issue, days_overdue, manager_escalated } of overdueIssues) {
      try {
        // Send notification to assignee
        if (issue.assignee && issue.due_date) {
          await notifyOverdueIssue(issue as IssueWithRelations & { due_date: string }, days_overdue);
          sent++;
        }

        // Escalate to manager if overdue for more than 3 days
        if (manager_escalated && issue.due_date) {
          const project = await projectRepository.findById(issue.project_id);
          if (project) {
            const projectOwner = await userRepository.findById(project.owner_id);
            if (projectOwner && (projectOwner.role === UserRole.MANAGER || projectOwner.role === UserRole.ADMIN)) {
              await notifyManagerEscalation(issue as IssueWithRelations & { due_date: string }, days_overdue, projectOwner);
              escalated++;
            }
          }
        }
      } catch (error) {
        console.error(`Failed to notify for issue ${issue.id}:`, error);
        errors++;
      }
    }

    return { sent, escalated, errors };
  }

  /**
   * Get issues approaching due date (within 2 days)
   */
  async getApproachingDueIssues(daysThreshold: number = 2): Promise<IssueWithRelations[]> {
    const allIssues = await issueRepository.findAllWithRelations();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + daysThreshold);

    return allIssues.filter(issue => {
      if (!issue.due_date) return false;
      if (issue.status === 'closed' || issue.status === 'resolved') return false;

      const dueDate = new Date(issue.due_date);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate > now && dueDate <= threshold;
    });
  }

  /**
   * Send reminders for issues approaching due date
   */
  async sendDueDateReminders(): Promise<number> {
    const approachingIssues = await this.getApproachingDueIssues();
    let sent = 0;

    for (const issue of approachingIssues) {
      try {
        if (issue.assignee && issue.due_date) {
          const dueDate = new Date(issue.due_date);
          const now = new Date();
          const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Send Slack notification
          await notifyOverdueIssue(issue as IssueWithRelations & { due_date: string }, -daysRemaining); // Negative means days until due
          sent++;
        }
      } catch (error) {
        console.error(`Failed to send reminder for issue ${issue.id}:`, error);
      }
    }

    return sent;
  }

  /**
   * Get overdue issues grouped by assignee
   */
  async getOverdueIssuesByAssignee(): Promise<Map<string, OverdueIssue[]>> {
    const overdueIssues = await this.getOverdueIssues();
    const groupedIssues = new Map<string, OverdueIssue[]>();

    for (const overdueIssue of overdueIssues) {
      if (overdueIssue.issue.assignee_id) {
        const existing = groupedIssues.get(overdueIssue.issue.assignee_id) || [];
        existing.push(overdueIssue);
        groupedIssues.set(overdueIssue.issue.assignee_id, existing);
      }
    }

    return groupedIssues;
  }

  /**
   * Get summary of overdue issues for dashboard
   */
  async getOverdueSummary(): Promise<{
    total_overdue: number;
    critical_overdue: number;
    high_overdue: number;
    needs_escalation: number;
    affected_users: number;
  }> {
    const overdueIssues = await this.getOverdueIssues();
    const assignees = new Set(overdueIssues.map(o => o.issue.assignee_id).filter(Boolean));

    return {
      total_overdue: overdueIssues.length,
      critical_overdue: overdueIssues.filter(o => o.issue.priority === 'critical').length,
      high_overdue: overdueIssues.filter(o => o.issue.priority === 'high').length,
      needs_escalation: overdueIssues.filter(o => o.manager_escalated).length,
      affected_users: assignees.size,
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
