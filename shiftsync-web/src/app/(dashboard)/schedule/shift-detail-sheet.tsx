'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { DetailSheet } from '@/components/dashboard/form-sheet';
import { SheetField, SheetSection, sheetTabsClass } from '@/components/dashboard/sheet-layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { apiClient } from '@/lib/api/client/client';
import { queryKeys } from '@/lib/query-keys';
import type { ShiftSummary } from '@/lib/api/server/shifts';
import { formatShiftTimeRange } from '@/lib/format-shift-time';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useAuthStore } from '@/lib/stores/auth.store';
import { PencilIcon, UserPlusIcon, HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShiftDetailSheetProps {
  shiftId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign?: (shift: ShiftSummary) => void;
  onEdit?: (shift: ShiftSummary) => void;
  afterMutation?: () => void;
  openAssignIfUnderstaffed?: boolean;
}

interface ShiftDetailResponse extends ShiftSummary {
  assignments?: { id: string; user?: { id: string; firstName: string; lastName: string; email: string } }[];
  history?: { id: string; action: string; createdAt: string; actor?: { email: string } }[];
}

async function fetchShiftDetail(id: string) {
  const { data } = await apiClient.get<ShiftDetailResponse>(`/shifts/${id}`);
  return data;
}

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';

export function ShiftDetailSheet({
  shiftId,
  open,
  onOpenChange,
  onAssign,
  onEdit,
  openAssignIfUnderstaffed = false,
}: ShiftDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const hasAutoOpenedAssign = useRef(false);
  const isAdmin = useAuthStore((s) => s.is('admin'));

  const { data: shift, isLoading } = useQuery({
    queryKey: queryKeys.shifts.detail(shiftId ?? ''),
    queryFn: () => fetchShiftDetail(shiftId!),
    enabled: open && !!shiftId,
  });

  useEffect(() => {
    if (!open) hasAutoOpenedAssign.current = false;
    if (!open || !shift || !onAssign || !openAssignIfUnderstaffed || hasAutoOpenedAssign.current) return;
    const assigned = shift.assignments?.length ?? 0;
    const needed = shift.headcountNeeded ?? 1;
    const slotsOpen = Math.max(0, needed - assigned);
    if (slotsOpen > 0) {
      hasAutoOpenedAssign.current = true;
      onAssign(shift);
    }
  }, [open, shift, onAssign, openAssignIfUnderstaffed]);

  useEffect(() => {
    if (!isAdmin && activeTab !== 'details') setActiveTab('details');
  }, [isAdmin, activeTab]);

  const assignedCount = shift?.assignments?.length ?? 0;
  const headcount = shift?.headcountNeeded ?? 1;
  const fillPct = Math.min(100, (assignedCount / headcount) * 100);

  const timeDisplay = shift
    ? (() => {
        const tz = shift.location?.ianaTimezone ?? 'UTC';
        const { primary, secondary } = formatShiftTimeRange({
          startAt: shift.startAt,
          endAt: shift.endAt,
          locationTimezone: tz,
          showUserLocal: true,
        });
        return { primary, secondary };
      })()
    : null;

  const understaffedBanner = shift
    ? (() => {
        const slotsOpen = Math.max(0, headcount - assignedCount);
        const startAt = shift.startAt ? new Date(shift.startAt) : null;
        const msUntil = startAt ? startAt.getTime() - Date.now() : 0;
        const hoursUntil = msUntil > 0 ? msUntil / (60 * 60 * 1000) : 0;
        const countdownLabel =
          hoursUntil >= 24
            ? `${Math.floor(hoursUntil / 24)} days`
            : hoursUntil >= 1
              ? `${Math.floor(hoursUntil)} hour${Math.floor(hoursUntil) !== 1 ? 's' : ''}`
              : hoursUntil > 0
                ? `${Math.max(1, Math.ceil(hoursUntil * 60))} min`
                : null;
        if (slotsOpen > 0 && countdownLabel) {
          return { slotsOpen, countdownLabel };
        }
        return null;
      })()
    : null;

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      header={
        isLoading || !shift ? (
          <Skeleton className="h-14 w-full rounded-xl" />
        ) : (
          <div>
            <SheetTitle className="text-xl">{shift.title ?? 'Untitled shift'}</SheetTitle>
            <SheetDescription className="mt-1">
              {shift.location?.name ?? shift.locationId}
            </SheetDescription>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={shift.status === 'published' ? 'default' : 'secondary'}>
                {shift.status}
              </Badge>
              {shift.isPremium && (
                <Badge variant="outline" className="border-brand-green/40 text-brand-green-dark">
                  Premium
                </Badge>
              )}
              <PermissionGate require="shifts:update">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full gap-1.5 text-xs"
                    onClick={() => onEdit(shift)}
                  >
                    <PencilIcon className="size-3.5" />
                    Edit
                  </Button>
                )}
              </PermissionGate>
              <PermissionGate require="assignments:create">
                {onAssign && (
                  <Button size="sm" className={cn('h-8 rounded-full gap-1.5 text-xs', primaryBtnClass)} onClick={() => onAssign(shift)}>
                    <UserPlusIcon className="size-3.5" />
                    Assign
                  </Button>
                )}
              </PermissionGate>
            </div>
          </div>
        )
      }
      tabs={
        isAdmin ? (
          <div className={sheetTabsClass}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 rounded-full px-3.5 text-sm font-medium',
                activeTab === 'details'
                  ? 'bg-brand-green/15 text-brand-green-dark hover:bg-brand-green/20'
                  : 'text-landing-steel hover:bg-landing-surface hover:text-brand-teal-deep',
              )}
              onClick={() => setActiveTab('details')}
            >
              Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 gap-1.5 rounded-full px-3.5 text-sm font-medium',
                activeTab === 'history'
                  ? 'bg-brand-green/15 text-brand-green-dark hover:bg-brand-green/20'
                  : 'text-landing-steel hover:bg-landing-surface hover:text-brand-teal-deep',
              )}
              onClick={() => setActiveTab('history')}
            >
              <HistoryIcon className="size-3.5" />
              History
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && shift && activeTab === 'details' && (
        <div className="flex flex-col gap-4">
          {understaffedBanner && (
            <div className="rounded-xl border border-brand-green/40 bg-brand-green/10 px-4 py-3">
              <p className="text-sm font-semibold text-brand-teal-deep">
                {understaffedBanner.slotsOpen} staff called out — {understaffedBanner.countdownLabel} until shift
              </p>
              <p className="mt-0.5 text-xs text-landing-steel">Assign a replacement below.</p>
            </div>
          )}

          <SheetSection title="Shift info" hoverable={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <SheetField label="Time (location)">
                <p className="text-sm font-medium text-brand-teal-deep">
                  {timeDisplay?.primary}
                  {timeDisplay?.secondary && (
                    <span className="ml-1 font-normal text-landing-steel">{timeDisplay.secondary}</span>
                  )}
                </p>
              </SheetField>
              <SheetField label="Required skill" value={shift.requiredSkill?.name ?? '—'} />
            </div>
            <SheetField label="Headcount">
              <p className="text-sm font-medium text-brand-teal-deep">
                {assignedCount} / {headcount}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-landing-surface">
                <div
                  className="h-full rounded-full bg-brand-green transition-all"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </SheetField>
          </SheetSection>

          <SheetSection title="Assigned staff">
            {shift.assignments?.length ? (
              <ul className="flex flex-col gap-2">
                {shift.assignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-landing-hairline bg-landing-surface/50 px-4 py-2.5 transition-colors hover:border-brand-green/20 hover:bg-brand-green/[0.03]"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-brand-green/15 text-xs font-semibold text-brand-green-dark">
                        {a.user ? `${a.user.firstName[0]}${a.user.lastName[0]}` : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-teal-deep">
                        {a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Unknown'}
                      </p>
                      {a.user?.email && (
                        <p className="truncate text-xs text-landing-steel">{a.user.email}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-landing-steel">No one assigned yet.</p>
            )}
          </SheetSection>
        </div>
      )}

      {!isLoading && shift && activeTab === 'history' && isAdmin && (
        <SheetSection title="Audit trail" hoverable={false}>
          {shift.history?.length ? (
            <ul className="flex flex-col gap-2">
              {shift.history.map((h) => (
                <li
                  key={h.id}
                  className="rounded-xl border border-landing-hairline bg-landing-surface/60 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-brand-teal-deep">{h.action}</span>
                  <p className="mt-0.5 text-xs text-landing-steel">
                    {new Date(h.createdAt).toLocaleString()} · {h.actor?.email ?? 'System'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-landing-steel">No history yet.</p>
          )}
        </SheetSection>
      )}
    </DetailSheet>
  );
}
