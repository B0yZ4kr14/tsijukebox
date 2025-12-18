import { ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { UserPermissions } from '@/types/user';

interface PermissionGateProps {
  /** The permission to check */
  permission: keyof UserPermissions;
  /** Content to render if permission is granted */
  children: ReactNode;
  /** Optional content to render if permission is denied */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on user permissions.
 * Checks customPermissions first, then falls back to role-based permissions.
 * 
 * @example
 * <PermissionGate permission="canAccessSettings">
 *   <SettingsButton />
 * </PermissionGate>
 * 
 * @example
 * <PermissionGate 
 *   permission="canManageUsers" 
 *   fallback={<span>No access</span>}
 * >
 *   <UserManagement />
 * </PermissionGate>
 */
export function PermissionGate({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission } = useUser();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(permissions: (keyof UserPermissions)[]) {
  const { hasPermission } = useUser();
  
  return permissions.reduce((acc, permission) => {
    acc[permission] = hasPermission(permission);
    return acc;
  }, {} as Record<keyof UserPermissions, boolean>);
}
