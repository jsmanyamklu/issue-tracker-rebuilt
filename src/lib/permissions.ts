import { UserRole, User, Issue, Project, Comment } from '@/types';

/**
 * Permission Helper Functions
 * Centralized permission checking for role-based access control
 */

// ==================== Role Hierarchy ====================

const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.DEVELOPER]: 2,
  [UserRole.VIEWER]: 1,
};

/**
 * Check if user has at least the specified role level
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Check if user is admin or manager
 */
export function isAdminOrManager(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
}

// ==================== Project Permissions ====================

export const ProjectPermissions = {
  /**
   * Can user create projects?
   */
  canCreate(userRole: UserRole): boolean {
    return hasMinimumRole(userRole, UserRole.DEVELOPER);
  },

  /**
   * Can user view project?
   */
  canView(userRole: UserRole): boolean {
    return true; // All authenticated users can view
  },

  /**
   * Can user edit this project?
   */
  canEdit(userRole: UserRole, userId: string, project: Project): boolean {
    // Admin and Manager can edit any project
    if (isAdminOrManager(userRole)) {
      return true;
    }
    // Owner can edit their own project
    return project.owner_id === userId;
  },

  /**
   * Can user delete this project?
   */
  canDelete(userRole: UserRole, userId: string, project: Project): boolean {
    // Admin can delete any project
    if (isAdmin(userRole)) {
      return true;
    }
    // Manager and owner can delete their own project
    if (userRole === UserRole.MANAGER && project.owner_id === userId) {
      return true;
    }
    // Developer can delete their own project
    return userRole === UserRole.DEVELOPER && project.owner_id === userId;
  },
};

// ==================== Issue Permissions ====================

export const IssuePermissions = {
  /**
   * Can user create issues?
   */
  canCreate(userRole: UserRole): boolean {
    return hasMinimumRole(userRole, UserRole.DEVELOPER);
  },

  /**
   * Can user view issue?
   */
  canView(userRole: UserRole): boolean {
    return true; // All authenticated users can view
  },

  /**
   * Can user edit this issue?
   */
  canEdit(userRole: UserRole, userId: string, issue: Issue): boolean {
    // Admin and Manager can edit any issue
    if (isAdminOrManager(userRole)) {
      return true;
    }
    // Developer can edit issues assigned to them or reported by them
    if (userRole === UserRole.DEVELOPER) {
      return issue.assignee_id === userId || issue.reporter_id === userId;
    }
    return false;
  },

  /**
   * Can user assign issues to others?
   */
  canAssign(userRole: UserRole): boolean {
    return isAdminOrManager(userRole);
  },

  /**
   * Can user close this issue?
   */
  canClose(userRole: UserRole, userId: string, issue: Issue): boolean {
    // Admin and Manager can close any issue
    if (isAdminOrManager(userRole)) {
      return true;
    }
    // Developer can close issues assigned to them
    if (userRole === UserRole.DEVELOPER) {
      return issue.assignee_id === userId;
    }
    return false;
  },

  /**
   * Can user delete this issue?
   */
  canDelete(userRole: UserRole, userId: string, issue: Issue, projectOwnerId?: string): boolean {
    // Admin can delete any issue
    if (isAdmin(userRole)) {
      return true;
    }
    // Manager can delete issues in their own projects or issues they reported
    if (userRole === UserRole.MANAGER) {
      return (projectOwnerId && projectOwnerId === userId) || issue.reporter_id === userId;
    }
    // Developer can only delete issues they reported
    if (userRole === UserRole.DEVELOPER) {
      return issue.reporter_id === userId;
    }
    return false;
  },

  /**
   * Can user change issue status?
   */
  canChangeStatus(userRole: UserRole, userId: string, issue: Issue): boolean {
    return this.canEdit(userRole, userId, issue);
  },

  /**
   * Can user change issue priority?
   */
  canChangePriority(userRole: UserRole): boolean {
    return isAdminOrManager(userRole);
  },
};

// ==================== Comment Permissions ====================

export const CommentPermissions = {
  /**
   * Can user create comments?
   */
  canCreate(userRole: UserRole): boolean {
    return hasMinimumRole(userRole, UserRole.DEVELOPER);
  },

  /**
   * Can user view comments?
   */
  canView(userRole: UserRole): boolean {
    return true; // All authenticated users can view
  },

  /**
   * Can user edit this comment?
   */
  canEdit(userRole: UserRole, userId: string, comment: Comment): boolean {
    // Admin and Manager can edit any comment
    if (isAdminOrManager(userRole)) {
      return true;
    }
    // User can edit their own comment
    return comment.user_id === userId;
  },

  /**
   * Can user delete this comment?
   */
  canDelete(userRole: UserRole, userId: string, comment: Comment): boolean {
    // Admin and Manager can delete any comment
    if (isAdminOrManager(userRole)) {
      return true;
    }
    // User can delete their own comment
    return comment.user_id === userId;
  },
};

// ==================== Admin Permissions ====================

export const AdminPermissions = {
  /**
   * Can user manage user roles?
   */
  canManageRoles(userRole: UserRole): boolean {
    return isAdmin(userRole);
  },

  /**
   * Can user view admin panel?
   */
  canViewAdminPanel(userRole: UserRole): boolean {
    return isAdmin(userRole);
  },

  /**
   * Can user assign this role?
   */
  canAssignRole(adminRole: UserRole, targetRole: UserRole): boolean {
    // Only admins can assign roles
    if (!isAdmin(adminRole)) {
      return false;
    }
    // Admin can assign any role
    return true;
  },
};

// ==================== Utility Functions ====================

/**
 * Get human-readable role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.MANAGER]: 'Manager',
    [UserRole.DEVELOPER]: 'Developer',
    [UserRole.VIEWER]: 'Viewer',
  };
  return roleNames[role];
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'red',
    [UserRole.MANAGER]: 'blue',
    [UserRole.DEVELOPER]: 'green',
    [UserRole.VIEWER]: 'gray',
  };
  return colors[role];
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.VIEWER];
}
