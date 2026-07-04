'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DetailSheet, FormSheet } from '@/components/dashboard/form-sheet';
import { FormSelect } from '@/components/dashboard/filter-select';
import { SheetField, SheetSection, sheetTabsClass } from '@/components/dashboard/sheet-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { apiClient } from '@/lib/api/client/client';
import { queryKeys } from '@/lib/query-keys';
import type { UserSummary } from '@/lib/api/server/users';
import { formatShiftTimeRange } from '@/lib/format-shift-time';
import { RoleGate } from '@/components/shared/RoleGate';
import { AvailabilityEditor } from './availability-editor';
import {
  UserIcon,
  WrenchIcon,
  AwardIcon,
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon,
  PlusIcon,
  XIcon,
  ShieldOffIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';

type TabId = 'profile' | 'skills' | 'certifications' | 'availability' | 'schedule' | 'overtime';

interface StaffDetailSheetProps {
  user: UserSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <UserIcon className="size-3.5" /> },
  { id: 'skills', label: 'Skills', icon: <WrenchIcon className="size-3.5" /> },
  { id: 'certifications', label: 'Certifications', icon: <AwardIcon className="size-3.5" /> },
  { id: 'availability', label: 'Availability', icon: <CalendarIcon className="size-3.5" /> },
  { id: 'schedule', label: 'Schedule', icon: <ClockIcon className="size-3.5" /> },
  { id: 'overtime', label: 'Overtime', icon: <TrendingUpIcon className="size-3.5" /> },
];

export function StaffDetailSheet({ user, open, onOpenChange, onClose }: StaffDetailSheetProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const { data: detail, isLoading } = useQuery({
    queryKey: queryKeys.users.detail(user?.id ?? ''),
    queryFn: async () => {
      const { data } = await apiClient.get<UserSummary>(`/users/${user!.id}`);
      return data;
    },
    enabled: open && !!user?.id,
  });

  const u = detail ?? user;

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
    onOpenChange(nextOpen);
  };

  return (
    <DetailSheet
      open={open}
      onOpenChange={handleClose}
      size="detail"
      header={
        u ? (
          <div className="flex items-start gap-4">
            <Avatar className="size-14 shrink-0 rounded-2xl">
              <AvatarFallback className="rounded-2xl bg-brand-green/15 text-lg font-bold text-brand-green-dark">
                {u.firstName[0]}
                {u.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 pt-0.5">
              <SheetTitle className="truncate text-xl">
                {u.firstName} {u.lastName}
              </SheetTitle>
              <SheetDescription className="mt-1 truncate">{u.email}</SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {u.role}
                </Badge>
                <Badge variant={u.isActive ? 'default' : 'destructive'}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <Skeleton className="h-16 w-full rounded-xl" />
        )
      }
      tabs={
        <div className={sheetTabsClass}>
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 shrink-0 gap-1.5 rounded-full px-3.5 text-sm font-medium',
                activeTab === tab.id
                  ? 'bg-brand-green/15 text-brand-green-dark hover:bg-brand-green/20'
                  : 'text-landing-steel hover:bg-landing-surface hover:text-brand-teal-deep',
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      }
    >
      {!u && isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      )}
      {u && activeTab === 'profile' && (
        <ProfileTab user={u} onUpdated={() => queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(u.id) })} />
      )}
      {u && activeTab === 'skills' && (
        <SkillsTab user={u} onUpdated={() => queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(u.id) })} />
      )}
      {u && activeTab === 'certifications' && (
        <CertificationsTab user={u} onUpdated={() => queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(u.id) })} />
      )}
      {u && activeTab === 'availability' && <AvailabilityEditor userId={u.id} />}
      {u && activeTab === 'schedule' && <StaffScheduleTab userId={u.id} />}
      {u && activeTab === 'overtime' && <OvertimeTab userId={u.id} />}
    </DetailSheet>
  );
}

function ProfileTab({ user, onUpdated }: { user: UserSummary; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      desiredHoursPerWeek: user.desiredHoursPerWeek ?? '',
    },
  });

  async function onSubmit(data: { firstName: string; lastName: string; phone: string; desiredHoursPerWeek: string | number }) {
    try {
      await apiClient.patch(`/users/${user.id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        desiredHoursPerWeek: data.desiredHoursPerWeek ? Number(data.desiredHoursPerWeek) : null,
      });
      toast.success('Profile updated');
      setEditing(false);
      onUpdated();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update');
    }
  }

  if (editing) {
    return (
      <SheetSection title="Edit profile" hoverable={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-brand-teal-deep">First name</Label>
              <Input {...register('firstName', { required: true })} className="h-11 border-landing-hairline" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-brand-teal-deep">Last name</Label>
              <Input {...register('lastName', { required: true })} className="h-11 border-landing-hairline" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-brand-teal-deep">Phone</Label>
            <Input {...register('phone')} className="h-11 border-landing-hairline" placeholder="+1 555 000 0000" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-brand-teal-deep">Desired hours per week</Label>
            <Input {...register('desiredHoursPerWeek')} type="number" className="h-11 border-landing-hairline" min={0} max={60} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting} className={primaryBtnClass}>
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetSection>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Contact & preferences">
        <div className="grid gap-4 sm:grid-cols-2">
          <SheetField label="Phone" value={user.phone ?? '—'} />
          <SheetField label="Desired hours / week" value={user.desiredHoursPerWeek ?? '—'} />
        </div>
        <SheetField
          label="Notifications"
          value={`In-app: ${user.notifyInApp ? 'On' : 'Off'} · Email: ${user.notifyEmail ? 'On' : 'Off'}`}
        />
      </SheetSection>
      <RoleGate role={['admin']}>
        <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setEditing(true)}>
          Edit profile
        </Button>
      </RoleGate>
    </div>
  );
}

function SkillsTab({ user, onUpdated }: { user: UserSummary; onUpdated: () => void }) {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [actioning, setActioning] = useState(false);

  const { data: allSkills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ id: string; name: string }[]>('/skills');
      return data;
    },
    enabled: addOpen,
  });

  const currentSkillIds = new Set((user.skills ?? []).map((s) => s.id));
  const available = allSkills.filter((s) => !currentSkillIds.has(s.id));

  async function addSkill() {
    if (!selectedSkillId) return;
    setActioning(true);
    try {
      await apiClient.post(`/users/${user.id}/skills`, { skillId: selectedSkillId });
      toast.success('Skill added');
      setAddOpen(false);
      setSelectedSkillId('');
      onUpdated();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    } finally {
      setActioning(false);
    }
  }

  async function removeSkill(skillId: string) {
    try {
      await apiClient.delete(`/users/${user.id}/skills/${skillId}`);
      toast.success('Skill removed');
      onUpdated();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    }
  }

  return (
    <SheetSection
      title="Assigned skills"
      description="Skills this team member can be scheduled for."
      action={
        <RoleGate role={['admin']}>
          <Button size="sm" variant="outline" className="h-8 rounded-full text-xs" onClick={() => setAddOpen(true)}>
            <PlusIcon className="mr-1 size-3.5" /> Add skill
          </Button>
        </RoleGate>
      }
    >
      <div className="flex flex-wrap gap-2">
        {(user.skills ?? []).map((s) => (
          <div
            key={s.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-landing-hairline bg-landing-surface/80 px-3 py-1 text-sm font-medium text-brand-teal-deep"
          >
            {s.name}
            <RoleGate role={['admin']}>
              <button
                type="button"
                onClick={() => removeSkill(s.id)}
                className="text-landing-steel transition-colors hover:text-destructive"
                aria-label={`Remove ${s.name}`}
              >
                <XIcon className="size-3.5" />
              </button>
            </RoleGate>
          </div>
        ))}
        {(!user.skills || user.skills.length === 0) && (
          <p className="text-sm text-landing-steel">No skills assigned yet.</p>
        )}
      </div>

      <FormSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add skill"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addSkill} disabled={!selectedSkillId || actioning} className={primaryBtnClass}>
              Add skill
            </Button>
          </>
        }
      >
        <FormSelect
          value={selectedSkillId}
          onValueChange={setSelectedSkillId}
          placeholder="Select skill"
          options={available.map((s) => ({ value: s.id, label: s.name }))}
        />
      </FormSheet>
    </SheetSection>
  );
}

function CertificationsTab({ user, onUpdated }: { user: UserSummary; onUpdated: () => void }) {
  const [addOpen, setAddOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; locationName: string } | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [actioning, setActioning] = useState(false);

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ id: string; name: string }[]>('/locations');
      return data;
    },
    enabled: addOpen,
  });

  const activeCerts = (user.locationCertifications ?? []).filter((c) => !c.revokedAt);
  const certifiedLocationIds = new Set(activeCerts.map((c) => c.locationId));
  const available = locations.filter((l) => !certifiedLocationIds.has(l.id));

  async function addCert() {
    if (!selectedLocationId) return;
    setActioning(true);
    try {
      await apiClient.post(`/users/${user.id}/certifications`, { locationId: selectedLocationId });
      toast.success('Certification added');
      setAddOpen(false);
      setSelectedLocationId('');
      onUpdated();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    } finally {
      setActioning(false);
    }
  }

  async function revokeCert() {
    if (!revokeTarget) return;
    setActioning(true);
    try {
      await apiClient.delete(`/users/${user.id}/certifications/${revokeTarget.id}`, {
        data: { reason: revokeReason || 'Revoked by admin' },
      });
      toast.success('Certification revoked');
      setRevokeTarget(null);
      setRevokeReason('');
      onUpdated();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed');
    } finally {
      setActioning(false);
    }
  }

  return (
    <SheetSection
      title="Location certifications"
      description="Locations this staff member is approved to work at."
      action={
        <RoleGate role={['admin']}>
          <Button size="sm" variant="outline" className="h-8 rounded-full text-xs" onClick={() => setAddOpen(true)}>
            <PlusIcon className="mr-1 size-3.5" /> Add certification
          </Button>
        </RoleGate>
      }
    >
      <ul className="flex flex-col gap-2">
        {activeCerts.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-landing-hairline bg-landing-surface/50 px-4 py-3 transition-colors hover:border-brand-green/20 hover:bg-brand-green/[0.03]"
          >
            <span className="text-sm font-medium text-brand-teal-deep">
              {c.location?.name ?? c.locationId}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-brand-green/30 text-brand-green-dark">
                Certified
              </Badge>
              <RoleGate role={['admin']}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    setRevokeTarget({
                      id: c.locationId,
                      locationName: c.location?.name ?? c.locationId,
                    })
                  }
                >
                  <ShieldOffIcon className="size-4" />
                </Button>
              </RoleGate>
            </div>
          </li>
        ))}
        {activeCerts.length === 0 && (
          <p className="text-sm text-landing-steel">No certified locations.</p>
        )}
      </ul>

      <FormSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add location certification"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addCert} disabled={!selectedLocationId || actioning} className={primaryBtnClass}>
              Certify
            </Button>
          </>
        }
      >
        <FormSelect
          value={selectedLocationId}
          onValueChange={setSelectedLocationId}
          placeholder="Select location"
          options={available.map((l) => ({ value: l.id, label: l.name }))}
        />
      </FormSheet>

      <FormSheet
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke certification"
        description={`Revoke ${user.firstName}'s certification for ${revokeTarget?.locationName}. Historical assignments are preserved.`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={revokeCert} disabled={actioning}>
              Revoke
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-brand-teal-deep">Reason (optional)</Label>
          <Input
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="Reason for revocation"
            className="h-11 border-landing-hairline"
          />
        </div>
      </FormSheet>
    </SheetSection>
  );
}

function StaffScheduleTab({ userId }: { userId: string }) {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const end = new Date();
  end.setDate(end.getDate() + 14);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const { data: assignments, isLoading } = useQuery({
    queryKey: queryKeys.users.assignments(userId, startStr, endStr),
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${userId}/assignments?startDate=${startStr}&endDate=${endStr}`);
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) return <Skeleton className="h-24 w-full rounded-xl" />;
  const list = Array.isArray(assignments) ? assignments : [];

  return (
    <SheetSection title="Schedule" description="Upcoming and recent shifts (±2 weeks)">
      {list.length === 0 ? (
        <p className="text-sm text-landing-steel">No assignments in this range.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.slice(0, 15).map((a: {
            id: string;
            status: string;
            shift?: { title?: string; startAt?: string; endAt?: string; location?: { name?: string; ianaTimezone?: string } };
          }) => {
            const shift = a.shift;
            const timeLabel =
              shift?.startAt && shift?.endAt
                ? formatShiftTimeRange({
                    startAt: shift.startAt,
                    endAt: shift.endAt,
                    locationTimezone: shift.location?.ianaTimezone ?? 'UTC',
                  }).primary
                : shift?.startAt
                  ? new Date(shift.startAt).toLocaleString()
                  : '—';
            return (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-landing-hairline px-4 py-3 transition-colors hover:border-brand-green/20 hover:bg-brand-green/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-teal-deep">
                    {shift?.title ?? 'Shift'}
                  </p>
                  <p className="mt-0.5 text-xs text-landing-steel">{timeLabel}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 capitalize">
                  {a.status}
                </Badge>
              </li>
            );
          })}
          {list.length > 15 && (
            <p className="text-xs text-landing-muted">+{list.length - 15} more shifts</p>
          )}
        </ul>
      )}
    </SheetSection>
  );
}

function OvertimeTab({ userId }: { userId: string }) {
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() - i * 7);
    return d.toISOString().slice(0, 10);
  }).reverse();

  const weekQueries = useQuery({
    queryKey: ['user-overtime-history', userId],
    queryFn: async () => {
      const results = await Promise.all(
        weeks.map(async (weekStart) => {
          try {
            const { data } = await apiClient.get<{ userId: string; name: string; projectedHours: number }[]>(
              `/analytics/overtime?weekStart=${weekStart}`,
            );
            const row = data.find((r) => r.userId === userId);
            return { weekStart, hours: row?.projectedHours ?? 0 };
          } catch {
            return { weekStart, hours: 0 };
          }
        }),
      );
      return results;
    },
    enabled: !!userId,
  });

  if (weekQueries.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  const chartData = (weekQueries.data ?? []).map((d) => ({
    week: new Date(d.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: d.hours,
  }));

  const latest = chartData[chartData.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Weekly hours" hoverable={false}>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-landing-steel">This week</p>
            <p
              className={cn(
                'font-display text-3xl font-semibold tracking-tight',
                latest?.hours >= 40
                  ? 'text-destructive'
                  : latest?.hours >= 35
                    ? 'text-landing-accent-orange'
                    : 'text-brand-teal-deep',
              )}
            >
              {latest?.hours ?? 0}h
            </p>
          </div>
          {latest?.hours >= 40 && <Badge variant="destructive">Overtime</Badge>}
          {latest?.hours >= 35 && latest.hours < 40 && (
            <Badge variant="outline" className="border-landing-accent-orange text-landing-accent-orange">
              Approaching OT
            </Badge>
          )}
        </div>
      </SheetSection>
      <SheetSection title="8-week history" hoverable={false}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e5e8" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#7c8c9a' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#7c8c9a' }} domain={[0, 60]} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10 }} formatter={(v: number) => [`${v}h`, 'Hours']} />
            <ReferenceLine y={40} stroke="#fa6e39" strokeDasharray="3 3" />
            <ReferenceLine y={35} stroke="#7b3ff2" strokeDasharray="3 3" />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="#00ed64" />
          </BarChart>
        </ResponsiveContainer>
      </SheetSection>
    </div>
  );
}
