'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client/client';
import { queryKeys } from '@/lib/query-keys';
import type { AuditLogEntry } from '@/lib/api/server/audit';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { PageHeader } from '@/components/dashboard/page-header';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';

export function AuditClient() {
  const [actorEmail, setActorEmail] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;
  const offset = (page - 1) * limit;

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', actorEmail, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (actorEmail) params.set('actorEmail', actorEmail);
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      const { data } = await apiClient.get<AuditLogEntry[]>(`/audit/logs?${params.toString()}`);
      return data;
    },
  });

  const totalPages = logs.length < limit ? page : page + 1;

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (actorEmail) params.set('actorEmail', actorEmail);
    const { data } = await apiClient.get<string>(`/audit/logs/export?${params.toString()}`, {
      responseType: 'text',
    });
    const blob = new Blob([data], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'audit-logs.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track platform activity, changes, and user actions."
        actions={
          <PermissionGate require="audit:export">
            <Button
              size="sm"
              className={`min-h-[44px] sm:min-h-0 ${primaryBtnClass}`}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </PermissionGate>
        }
      />

      <PermissionGate require="audit:view" fallback={<p className="text-sm text-landing-steel">You need audit:view permission.</p>}>
        <FilterBar>
          <input
            type="text"
            placeholder="Search by actor email…"
            className="h-10 w-full min-h-[44px] rounded-md border border-input bg-background px-3 text-sm text-foreground sm:h-9 sm:w-64 sm:min-h-0"
            value={actorEmail}
            onChange={(e) => { setActorEmail(e.target.value); setPage(1); }}
          />
        </FilterBar>

        {isLoading && <div className="text-sm text-landing-steel">Loading…</div>}
        {!isLoading && (
          <DashboardCard title="Activity log" noPadding>
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-landing-steel">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      {log.actor ? `${log.actor.email}` : log.actorId ?? '—'}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="text-landing-steel">
                      {log.entityType} {log.entityId}
                    </TableCell>
                    <TableCell className="text-landing-steel">{log.location?.name ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {logs.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-landing-steel">No audit logs.</div>
            )}
          </DashboardCard>
        )}
        <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </PermissionGate>
    </div>
  );
}
