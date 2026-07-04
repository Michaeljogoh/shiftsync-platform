'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { DetailSheet, FormSheet } from '@/components/dashboard/form-sheet';
import { SheetSection } from '@/components/dashboard/sheet-layout';
import { FormSelect } from '@/components/dashboard/filter-select';
import { FormSelectField } from '@/components/dashboard/form-select-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { PageHeader } from '@/components/dashboard/page-header';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { apiClient } from '@/lib/api/client/client';
import { RoleGate } from '@/components/shared/RoleGate';
import { FullPageError } from '@/components/shared/FullPageError';
import { PaginationControls, usePagination } from '@/components/shared/PaginationControls';
import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UserPlusIcon,
  UserMinusIcon,
  GlobeIcon,
} from 'lucide-react';

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';

const IANA_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
];

const locationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().optional(),
  ianaTimezone: z.string().min(1, 'Timezone is required'),
});

type LocationForm = z.infer<typeof locationSchema>;

interface Location {
  id: string;
  name: string;
  address?: string;
  ianaTimezone: string;
  isActive: boolean;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AllUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function LocationsClient() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [detailLocation, setDetailLocation] = useState<Location | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null);
  const [addManagerOpen, setAddManagerOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [actioning, setActioning] = useState(false);
  const [locPage, setLocPage] = useState(1);
  const [staffSheetPage, setStaffSheetPage] = useState(1);

  const LOC_PAGE_SIZE = 9;

  const { data: locations = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await apiClient.get<Location[]>('/locations');
      return data;
    },
  });

  const { totalPages: locTotalPages, paginate: paginateLocs } = usePagination(locations, LOC_PAGE_SIZE);
  const pagedLocations = paginateLocs(locPage);

  const { data: locationStaff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['location-staff', detailLocation?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<StaffMember[]>(`/locations/${detailLocation!.id}/staff`);
      return data;
    },
    enabled: !!detailLocation,
  });

  const filteredStaff = locationStaff.filter((s) => s.role === 'staff');
  const { totalPages: sheetStaffPages, paginate: paginateSheetStaff } = usePagination(filteredStaff, 5);
  const pagedSheetStaff = paginateSheetStaff(staffSheetPage);

  const { data: locationManagers = [], isLoading: managersLoading } = useQuery({
    queryKey: ['location-managers', detailLocation?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<Manager[]>(`/locations/${detailLocation!.id}/managers`);
      return data;
    },
    enabled: !!detailLocation,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<AllUser[]>('/users');
      return data;
    },
    enabled: addManagerOpen,
  });

  const managerUsers = allUsers.filter((u) => u.role === 'manager' || u.role === 'admin');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: '', address: '', ianaTimezone: 'America/New_York' },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    control: editControl,
    formState: { errors: editErrors, isSubmitting: editSubmitting },
  } = useForm<LocationForm>({ resolver: zodResolver(locationSchema) });

  function openEdit(loc: Location) {
    setEditLocation(loc);
    resetEdit({ name: loc.name, address: loc.address ?? '', ianaTimezone: loc.ianaTimezone });
  }

  async function onCreate(data: LocationForm) {
    try {
      await apiClient.post('/locations', data);
      toast.success('Location created');
      setCreateOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create');
    }
  }

  async function onEdit(data: LocationForm) {
    if (!editLocation) return;
    try {
      await apiClient.patch(`/locations/${editLocation.id}`, data);
      toast.success('Location updated');
      setEditLocation(null);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update');
    }
  }

  async function onDelete() {
    if (!deleteConfirm) return;
    setActioning(true);
    try {
      await apiClient.delete(`/locations/${deleteConfirm.id}`);
      toast.success('Location deleted');
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete');
    } finally {
      setActioning(false);
    }
  }

  async function onAddManager() {
    if (!detailLocation || !selectedManagerId) return;
    setActioning(true);
    try {
      await apiClient.post(`/locations/${detailLocation.id}/managers`, { managerId: selectedManagerId });
      toast.success('Manager added');
      setAddManagerOpen(false);
      setSelectedManagerId('');
      queryClient.invalidateQueries({ queryKey: ['location-managers', detailLocation.id] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add manager');
    } finally {
      setActioning(false);
    }
  }

  async function onRemoveManager(managerId: string) {
    if (!detailLocation) return;
    setActioning(true);
    try {
      await apiClient.delete(`/locations/${detailLocation.id}/managers/${managerId}`);
      toast.success('Manager removed');
      queryClient.invalidateQueries({ queryKey: ['location-managers', detailLocation.id] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to remove manager');
    } finally {
      setActioning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader title="Locations" description="Manage restaurant locations, managers, and certified staff." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <FullPageError message="Failed to load locations." onRetry={() => refetch()} />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Locations"
        description="Manage restaurant locations, managers, and certified staff."
        actions={
          <RoleGate role={['admin']}>
            <Button size="sm" className={`min-h-[44px] sm:min-h-0 ${primaryBtnClass}`} onClick={() => setCreateOpen(true)}>
              <PlusIcon className="mr-1.5 size-4" /> Add location
            </Button>
          </RoleGate>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pagedLocations.map((loc) => (
          <DashboardCard
            key={loc.id}
            title={loc.name}
            hoverable
            className="cursor-pointer"
            action={
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <RoleGate role={['admin']}>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(loc)}>
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(loc)}>
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </RoleGate>
              </div>
            }
          >
            <div
              className="space-y-2 cursor-pointer"
              onClick={() => { setDetailLocation(loc); setStaffSheetPage(1); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setDetailLocation(loc); setStaffSheetPage(1); } }}
              role="button"
              tabIndex={0}
            >
              {loc.address && (
                <p className="text-xs text-landing-steel truncate">{loc.address}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-landing-steel">
                <GlobeIcon className="size-3" />
                {loc.ianaTimezone}
              </div>
              <Badge variant={loc.isActive ? 'default' : 'secondary'} className="text-xs">
                {loc.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </DashboardCard>
        ))}
      </div>
      <PaginationControls currentPage={locPage} totalPages={locTotalPages} onPageChange={setLocPage} />

      {/* Detail Sheet */}
      <DetailSheet
        open={!!detailLocation}
        onOpenChange={(open) => !open && setDetailLocation(null)}
        size="detail"
        header={
          detailLocation ? (
            <div>
              <SheetTitle className="text-xl">{detailLocation.name}</SheetTitle>
              <SheetDescription className="mt-1 flex flex-wrap items-center gap-2">
                <GlobeIcon className="size-3.5 shrink-0" />
                {detailLocation.ianaTimezone}
                <Badge variant={detailLocation.isActive ? 'default' : 'secondary'} className="ml-1">
                  {detailLocation.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </SheetDescription>
              {detailLocation.address && (
                <p className="mt-2 text-sm text-landing-steel">{detailLocation.address}</p>
              )}
            </div>
          ) : null
        }
      >
        {detailLocation && (
          <div className="flex flex-col gap-4">
            <SheetSection
              title="Managers"
              description="People who can manage this location."
              action={
                <RoleGate role={['admin']}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full text-xs"
                    onClick={() => setAddManagerOpen(true)}
                  >
                    <UserPlusIcon className="mr-1 size-3.5" /> Add
                  </Button>
                </RoleGate>
              }
            >
              {managersLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {locationManagers.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between rounded-xl border border-landing-hairline bg-landing-surface/50 px-4 py-3 transition-colors hover:border-brand-green/20 hover:bg-brand-green/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-teal-deep">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="truncate text-xs text-landing-steel">{m.email}</p>
                      </div>
                      <RoleGate role={['admin']}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 shrink-0 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onRemoveManager(m.id)}
                          disabled={actioning}
                        >
                          <UserMinusIcon className="size-4" />
                        </Button>
                      </RoleGate>
                    </li>
                  ))}
                  {locationManagers.length === 0 && (
                    <p className="text-sm text-landing-steel">No managers assigned.</p>
                  )}
                </ul>
              )}
            </SheetSection>

            <SheetSection
              title="Certified staff"
              description="Team members approved to work at this location."
            >
              {staffLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <ul className="flex flex-col gap-2">
                    {pagedSheetStaff.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-3 rounded-xl border border-landing-hairline bg-landing-surface/50 px-4 py-3 transition-colors hover:border-brand-green/20 hover:bg-brand-green/[0.03]"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/15 text-xs font-semibold text-brand-green-dark">
                          {s.firstName[0]}
                          {s.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-brand-teal-deep">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="truncate text-xs text-landing-steel">{s.email}</p>
                        </div>
                      </li>
                    ))}
                    {filteredStaff.length === 0 && (
                      <p className="text-sm text-landing-steel">No certified staff.</p>
                    )}
                  </ul>
                  <PaginationControls
                    currentPage={staffSheetPage}
                    totalPages={sheetStaffPages}
                    onPageChange={setStaffSheetPage}
                  />
                </>
              )}
            </SheetSection>
          </div>
        )}
      </DetailSheet>

      {/* Create */}
      <FormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add location"
        description="Create a new Coastal Eats location."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" form="create-location-form" disabled={isSubmitting} className={primaryBtnClass}>Create</Button>
          </>
        }
      >
        <form id="create-location-form" onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name *</label>
            <Input {...register('name')} placeholder="Coastal Eats Downtown" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Address</label>
            <Input {...register('address')} placeholder="123 Main St, New York, NY" />
          </div>
          <FormSelectField
            control={control}
            name="ianaTimezone"
            label="Timezone *"
            placeholder="Select timezone"
            options={IANA_TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
            error={errors.ianaTimezone?.message}
          />
        </form>
      </FormSheet>

      {/* Edit */}
      <FormSheet
        open={!!editLocation}
        onOpenChange={(open) => !open && setEditLocation(null)}
        title="Edit location"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditLocation(null)}>Cancel</Button>
            <Button type="submit" form="edit-location-form" disabled={editSubmitting} className={primaryBtnClass}>Save changes</Button>
          </>
        }
      >
        <form id="edit-location-form" onSubmit={handleEditSubmit(onEdit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name *</label>
            <Input {...registerEdit('name')} />
            {editErrors.name && <p className="text-xs text-destructive">{editErrors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Address</label>
            <Input {...registerEdit('address')} />
          </div>
          <FormSelectField
            control={editControl}
            name="ianaTimezone"
            label="Timezone *"
            placeholder="Select timezone"
            options={IANA_TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
            error={editErrors.ianaTimezone?.message}
          />
        </form>
      </FormSheet>

      {/* Delete confirm */}
      <FormSheet
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete location?"
        description={`This will permanently delete ${deleteConfirm?.name}. This cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={onDelete} disabled={actioning}>Delete</Button>
          </>
        }
      >
        <></>
      </FormSheet>

      {/* Add Manager */}
      <FormSheet
        open={addManagerOpen}
        onOpenChange={setAddManagerOpen}
        title={`Add manager to ${detailLocation?.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setAddManagerOpen(false)}>Cancel</Button>
            <Button onClick={onAddManager} disabled={!selectedManagerId || actioning} className={primaryBtnClass}>Add</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Select manager</label>
          <FormSelect
            value={selectedManagerId}
            onValueChange={setSelectedManagerId}
            placeholder="— Choose —"
            options={managerUsers.map((u) => ({
              value: u.id,
              label: `${u.firstName} ${u.lastName} (${u.email})`,
            }))}
          />
        </div>
      </FormSheet>
    </div>
  );
}
