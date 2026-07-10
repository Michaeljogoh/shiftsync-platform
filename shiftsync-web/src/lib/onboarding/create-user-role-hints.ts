export type CreateUserRole = 'staff' | 'manager' | 'admin';

export const CREATE_USER_ROLE_HINTS: Record<
  CreateUserRole,
  { label: string; description: string }
> = {
  staff: {
    label: 'Staff',
    description: 'Views their schedule and can request shift swaps.',
  },
  manager: {
    label: 'Manager',
    description: 'Builds schedules and approves swap requests.',
  },
  admin: {
    label: 'Admin',
    description: 'Full access — locations, skills, and user management.',
  },
};
