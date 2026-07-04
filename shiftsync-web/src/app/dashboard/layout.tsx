'use client';

import type React from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
