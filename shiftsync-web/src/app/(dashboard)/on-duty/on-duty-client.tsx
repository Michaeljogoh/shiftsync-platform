'use client';

import { useEffect, useCallback, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client/client';
import { useOnDutyStore } from '@/lib/stores/on-duty.store';
import { PaginationControls, usePagination } from '@/components/shared/PaginationControls';
import { PageHeader } from '@/components/dashboard/page-header';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import type { LocationSummary } from '@/lib/api/server/locations';
import type { OnDutyPayload } from '@/lib/stores/on-duty.store';
import { ClockIcon, UsersIcon } from 'lucide-react';

interface OnDutyEntry {
  userId: string;
  shiftId: string;
}

interface EnrichedEntry extends OnDutyEntry {
  name: string;
  initials: string;
  shiftTitle?: string;
}

function LocationClock({ ianaTimezone }: { ianaTimezone: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    function update() {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTime(formatter.format(new Date()));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [ianaTimezone]);

  return <span className="font-mono text-brand-teal-deep">{time}</span>;
}

interface OnDutyClientProps {
  locations: LocationSummary[];
}

export function OnDutyClient({ locations }: OnDutyClientProps) {
  const data = useOnDutyStore((s) => s.data);
  const setBulk = useOnDutyStore((s) => s.setBulk);
  const [userNames, setUserNames] = useState<Record<string, { name: string; initials: string }>>({});
  const [loading, setLoading] = useState(true);
  const [locPage, setLocPage] = useState(1);
  const LOC_PAGE_SIZE = 6;
  const { totalPages: locTotalPages, paginate: paginateLocs } = usePagination(locations, LOC_PAGE_SIZE);
  const pagedLocations = paginateLocs(locPage);

  const fetchOnDuty = useCallback(async () => {
    if (locations.length === 0) return;
    const updates: Record<string, OnDutyPayload> = {};
    await Promise.all(
      locations.map(async (loc) => {
        try {
          const res = await apiClient.get<OnDutyEntry[]>(`/locations/${loc.id}/on-duty`);
          updates[loc.id] = {
            locationId: loc.id,
            onDuty: Array.isArray(res.data) ? res.data : [],
            at: new Date().toISOString(),
          };
        } catch {
          updates[loc.id] = { locationId: loc.id, onDuty: [], at: new Date().toISOString() };
        }
      }),
    );
    setBulk(updates);
    setLoading(false);

    // Resolve user names for all on-duty user IDs
    const allUserIds = new Set<string>();
    Object.values(updates).forEach((payload) => {
      payload.onDuty.forEach((e: OnDutyEntry) => allUserIds.add(e.userId));
    });

    const nameMap: Record<string, { name: string; initials: string }> = {};
    await Promise.all(
      Array.from(allUserIds).map(async (uid) => {
        if (userNames[uid]) { nameMap[uid] = userNames[uid]; return; }
        try {
          const { data: user } = await apiClient.get<{ firstName: string; lastName: string }>(`/users/${uid}`);
          const name = `${user.firstName} ${user.lastName}`;
          nameMap[uid] = { name, initials: `${user.firstName[0]}${user.lastName[0]}` };
        } catch {
          nameMap[uid] = { name: 'Unknown', initials: '??' };
        }
      }),
    );
    setUserNames((prev) => ({ ...prev, ...nameMap }));
  }, [locations, setBulk, userNames]);

  useEffect(() => {
    fetchOnDuty();
  }, [fetchOnDuty]);

  if (locations.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader title="On-Duty Dashboard" description="See who is currently on shift at each location." />
        <p className="text-sm text-landing-steel">No locations available.</p>
      </div>
    );
  }

  const totalOnDuty = Object.values(data).reduce((sum, p) => sum + (p?.onDuty?.length ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="On-Duty Dashboard"
        description="Real-time — updates every minute via WebSocket. Times shown in each location's timezone."
        actions={
          <div className="flex items-center gap-2 text-sm text-landing-steel">
            <UsersIcon className="size-4" />
            <span>{totalOnDuty} on duty now</span>
            <span className="inline-flex size-2 rounded-full bg-brand-green animate-pulse" />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pagedLocations.map((loc) => {
          const payload = data[loc.id];
          const onDuty: OnDutyEntry[] = payload?.onDuty ?? [];
          const count = onDuty.length;

          const enriched: EnrichedEntry[] = onDuty.map((e) => ({
            ...e,
            name: userNames[e.userId]?.name ?? 'Loading…',
            initials: userNames[e.userId]?.initials ?? '??',
          }));

          return (
            <DashboardCard
              key={loc.id}
              title={loc.name}
              action={
                <Badge variant={count > 0 ? 'default' : 'secondary'} className="text-xs">
                  {count} on duty
                </Badge>
              }
            >
              <div className="flex items-center gap-1.5 text-sm text-landing-steel">
                <ClockIcon className="size-3.5" />
                <LocationClock ianaTimezone={loc.ianaTimezone} />
                <span className="text-xs">({loc.ianaTimezone.split('/')[1]?.replace('_', ' ')})</span>
              </div>
              <div className="mt-3">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
                  </div>
                ) : enriched.length === 0 ? (
                  <p className="py-4 text-center text-sm text-landing-steel">No one currently on shift</p>
                ) : (
                  <ul className="space-y-2">
                    {enriched.map((e) => (
                      <li key={`${e.userId}-${e.shiftId}`} className="flex items-center gap-2.5 rounded-lg bg-landing-surface px-2.5 py-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-brand-green/15 text-brand-teal-deep font-medium">
                            {e.initials}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-brand-teal-deep font-medium">{e.name}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {payload?.at && !loading && (
                  <p className="mt-2 text-[10px] text-landing-muted">
                    Last sync: {new Date(payload.at).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </DashboardCard>
          );
        })}
      </div>
      <PaginationControls currentPage={locPage} totalPages={locTotalPages} onPageChange={setLocPage} />
    </div>
  );
}
