import type { Role } from '@/types/auth';

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin workspace',
  manager: 'Manager workspace',
  staff: 'Staff workspace',
};

export function formatRoleWorkspace(role?: Role | string | null): string {
  if (!role) return 'Member workspace';
  return ROLE_LABELS[role as Role] ?? `${role} workspace`;
}
