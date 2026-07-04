'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client/client';
import { queryKeys } from '@/lib/query-keys';
import { useNotificationsStore } from '@/lib/stores/notifications.store';
import { FullPageError } from '@/components/shared/FullPageError';
import type { NotificationItem } from '@/lib/api/server/notifications';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/page-header';
import { DashboardCard } from '@/components/dashboard/dashboard-card';

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';


const PAGE_SIZE = 25;

async function fetchNotificationsPage(offset: number) {
  const { data } = await apiClient.get<NotificationItem[]>(
    `/notifications?limit=${PAGE_SIZE}&offset=${offset}`,
  );
  return data;
}

async function fetchUnreadCountClient() {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

function groupNotifications(list: NotificationItem[]): { today: NotificationItem[]; thisWeek: NotificationItem[]; older: NotificationItem[] } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const today: NotificationItem[] = [];
  const thisWeek: NotificationItem[] = [];
  const older: NotificationItem[] = [];

  list.forEach((n) => {
    const d = new Date(n.createdAt);
    if (d >= startOfToday) today.push(n);
    else if (d >= startOfWeek) thisWeek.push(n);
    else older.push(n);
  });

  return { today, thisWeek, older };
}

export function NotificationsClient() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: listLoading,
    isError: listError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<NotificationItem[], Error>({
    queryKey: queryKeys.notifications.all(),
    queryFn: ({ pageParam }) => fetchNotificationsPage(pageParam as number),
    initialPageParam: 0 as number,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
  });

  const pages =
    data && Array.isArray((data as any).pages)
      ? ((data as any).pages as NotificationItem[][])
      : [];
  const notifications = useMemo(() => pages.flat(), [pages]);

  const { data: unreadCount, isLoading: countLoading } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: fetchUnreadCountClient,
  });

  const groups = useMemo(() => groupNotifications(notifications), [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      useNotificationsStore.getState().setAllRead();
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const isInitialLoading = listLoading && pages.length === 0;

  if (isInitialLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader title="Notifications" description="Stay up to date on schedule changes and team activity." />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader title="Notifications" description="Stay up to date on schedule changes and team activity." />
        <FullPageError
          message="Failed to load notifications. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })}
        />
      </div>
    );
  }

  const showUnreadBadge = !countLoading && (unreadCount ?? 0) > 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date on schedule changes and team activity."
        actions={
          showUnreadBadge ? (
            <>
              <span className="rounded-full bg-brand-green px-2 py-0.5 text-xs font-semibold text-brand-teal-deep">
                {unreadCount} unread
              </span>
              <Button size="sm" variant="outline" className="min-h-[44px]" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            </>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <DashboardCard title="You're all caught up ✓" description="No new notifications. Check back later.">
          <span className="sr-only">No notifications</span>
        </DashboardCard>
      ) : (
        <>
          {groups.today.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-landing-steel">Today</h2>
              <ul className="space-y-2">
                {groups.today.map((n) => (
                  <NotificationCard key={n.id} notification={n} onUpdate={() => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })} />
                ))}
              </ul>
            </section>
          )}
          {groups.thisWeek.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-landing-steel">This week</h2>
              <ul className="space-y-2">
                {groups.thisWeek.map((n) => (
                  <NotificationCard key={n.id} notification={n} onUpdate={() => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })} />
                ))}
              </ul>
            </section>
          )}
          {groups.older.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-landing-steel">Older</h2>
              <ul className="space-y-2">
                {groups.older.map((n) => (
                  <NotificationCard key={n.id} notification={n} onUpdate={() => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })} />
                ))}
              </ul>
            </section>
          )}
          <div className="flex justify-center pt-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={!hasNextPage || isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? 'Loading…' : hasNextPage ? 'Load more' : 'No more'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationCard({
  notification: n,
  onUpdate,
}: {
  notification: NotificationItem;
  onUpdate: () => void;
}) {
  const handleClick = async () => {
    if (!n.isRead) {
      try {
        await apiClient.patch(`/notifications/${n.id}/read`);
        onUpdate();
      } catch {
        // ignore
      }
    }
  };

  const href =
    n.referenceType === 'shift' && n.referenceId
      ? `/schedule?shiftId=${encodeURIComponent(n.referenceId)}&openAssign=1`
      : null;

  const content = (
    <Card
      className={`cursor-pointer border-landing-hairline bg-white transition-colors hover:bg-brand-green/[0.03] ${
        n.isRead ? 'opacity-80' : 'shadow-[0_1px_2px_rgba(0,30,43,0.04)]'
      }`}
      onClick={handleClick}
    >
        <CardHeader className="py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-brand-teal-deep">
                {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-brand-green" />}
                {n.title}
              </CardTitle>
              {n.body && (
                <CardDescription className="mt-1 text-xs text-landing-steel">{n.body}</CardDescription>
              )}
              <p className="mt-1 text-xs text-landing-muted">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
  );

  return (
    <li>
      {href ? (
        <Link href={href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
