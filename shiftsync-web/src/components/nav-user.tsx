'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { FormSheet } from '@/components/dashboard/form-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronsUpDownIcon, BellIcon, LogOutIcon, UserIcon, KeyIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { apiClient } from '@/lib/api/client/client';
import { toast } from 'sonner';

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const displayName = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`.trim() || session.user.email
    : 'User';
  const displayEmail = session?.user?.email ?? '';
  const initials = session?.user
    ? `${session.user.firstName?.[0] ?? ''}${session.user.lastName?.[0] ?? ''}`
    : '?';

  function handleLogout() {
    clearAuth();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="rounded-xl data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
              >
                <Avatar className="h-9 w-9 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-brand-green text-sm font-bold text-brand-teal-deep">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground">{displayName}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">{displayEmail}</span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Signed in as <strong className="text-foreground">{session?.role}</strong>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <UserIcon className="size-4" />
                  My profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNotifOpen(true)}>
                  <BellIcon className="size-4" />
                  Notification preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPwOpen(true)}>
                  <KeyIcon className="size-4" />
                  Change password
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOutIcon className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
      <NotifSheet open={notifOpen} onOpenChange={setNotifOpen} />
      <PasswordSheet open={pwOpen} onOpenChange={setPwOpen} />
    </>
  );
}

function ProfileSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const session = useAuthStore((s) => s.session);
  const [form, setForm] = useState({
    firstName: session?.user?.firstName ?? '',
    lastName: session?.user?.lastName ?? '',
    phone: '',
    desiredHoursPerWeek: '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!session?.user?.id) return;
    setSaving(true);
    try {
      await apiClient.patch(`/users/${session.user.id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || null,
        desiredHoursPerWeek: form.desiredHoursPerWeek ? Number(form.desiredHoursPerWeek) : null,
      });
      toast.success('Profile updated');
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="My profile"
      description="Update your personal information."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className={primaryBtnClass}>Save</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">First name</label>
            <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Last name</label>
            <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone</label>
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Desired hours/week</label>
          <Input type="number" value={form.desiredHoursPerWeek} onChange={(e) => setForm((f) => ({ ...f, desiredHoursPerWeek: e.target.value }))} min={0} max={60} placeholder="e.g. 40" />
        </div>
      </div>
    </FormSheet>
  );
}

function NotifSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await apiClient.patch('/auth/me/notifications', { notifyInApp, notifyEmail });
      toast.success('Notification preferences saved');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Notification preferences"
      description="Choose how you receive notifications from ShiftSync."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className={primaryBtnClass}>Save preferences</Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">In-app notifications</p>
            <p className="text-xs text-muted-foreground">Show badge and notification center entries</p>
          </div>
          <input type="checkbox" checked={notifyInApp} onChange={(e) => setNotifyInApp(e.target.checked)} className="h-4 w-4" />
        </label>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Email notifications</p>
            <p className="text-xs text-muted-foreground">Receive emails for schedule changes and swap updates</p>
          </div>
          <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="h-4 w-4" />
        </label>
      </div>
    </FormSheet>
  );
}

function PasswordSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters'); return; }
    setError('');
    setSaving(true);
    try {
      await apiClient.patch('/auth/me/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      onOpenChange(false);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Change password"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className={primaryBtnClass}>Change password</Button>
        </>
      }
    >
      <div className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm font-medium">Current password</label>
          <Input type="password" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">New password</label>
          <Input type="password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Confirm new password</label>
          <Input type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
        </div>
      </div>
    </FormSheet>
  );
}
