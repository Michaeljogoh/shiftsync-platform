'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client/client';
import { RoleGate } from '@/components/shared/RoleGate';
import { FullPageError } from '@/components/shared/FullPageError';
import { PaginationControls, usePagination } from '@/components/shared/PaginationControls';
import { PageHeader } from '@/components/dashboard/page-header';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { FormSheet } from '@/components/dashboard/form-sheet';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';

const primaryBtnClass =
  'rounded-full bg-brand-green text-brand-teal-deep hover:bg-brand-green/90 font-semibold';

interface Skill {
  id: string;
  name: string;
  description?: string;
}

interface SkillForm {
  name: string;
  description?: string;
}

export function SkillsClient() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Skill | null>(null);
  const [actioning, setActioning] = useState(false);
  const [skillsPage, setSkillsPage] = useState(1);

  const SKILLS_PAGE_SIZE = 12;

  const { data: skills = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await apiClient.get<Skill[]>('/skills');
      return data;
    },
  });

  const { totalPages: skillsTotalPages, paginate: paginateSkills } = usePagination(skills, SKILLS_PAGE_SIZE);
  const pagedSkills = paginateSkills(skillsPage);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SkillForm>();
  const { register: regEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { isSubmitting: editSubmitting } } = useForm<SkillForm>();

  function openEdit(skill: Skill) {
    setEditSkill(skill);
    resetEdit({ name: skill.name, description: skill.description ?? '' });
  }

  async function onCreate(data: SkillForm) {
    try {
      await apiClient.post('/skills', data);
      toast.success('Skill created');
      setCreateOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create');
    }
  }

  async function onEdit(data: SkillForm) {
    if (!editSkill) return;
    try {
      await apiClient.patch(`/skills/${editSkill.id}`, data);
      toast.success('Skill updated');
      setEditSkill(null);
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update');
    }
  }

  async function onDelete() {
    if (!deleteConfirm) return;
    setActioning(true);
    try {
      await apiClient.delete(`/skills/${deleteConfirm.id}`);
      toast.success('Skill deleted');
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete');
    } finally {
      setActioning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader title="Skills" description="Define skills that can be assigned to staff members." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError) return <FullPageError message="Failed to load skills." onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Skills"
        description="Define skills that can be assigned to staff members."
        actions={
          <RoleGate role={['admin']}>
            <Button size="sm" className={`min-h-[44px] sm:min-h-0 ${primaryBtnClass}`} onClick={() => setCreateOpen(true)}>
              <PlusIcon className="mr-1.5 size-4" /> Add skill
            </Button>
          </RoleGate>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pagedSkills.map((skill) => (
          <DashboardCard
            key={skill.id}
            title={skill.name}
            description={skill.description || 'No description'}
            hoverable
            action={
              <RoleGate role={['admin']}>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="size-8 p-0 hover:bg-brand-green/10" onClick={() => openEdit(skill)}>
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteConfirm(skill)}>
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </RoleGate>
            }
          >
            <span className="sr-only">{skill.name}</span>
          </DashboardCard>
        ))}
        {skills.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-landing-hairline bg-white py-12 text-center text-sm text-landing-steel transition-colors hover:border-brand-green/30 hover:bg-brand-green/[0.02]">
            No skills defined yet.
          </div>
        )}
      </div>
      <PaginationControls currentPage={skillsPage} totalPages={skillsTotalPages} onPageChange={setSkillsPage} />

      <FormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add skill"
        description="Create a new skill that can be assigned to staff."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" form="create-skill-form" disabled={isSubmitting} className={primaryBtnClass}>
              {isSubmitting ? 'Creating…' : 'Create skill'}
            </Button>
          </>
        }
      >
        <form id="create-skill-form" onSubmit={handleSubmit(onCreate)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-brand-teal-deep">Skill name *</Label>
            <Input {...register('name', { required: true })} placeholder="e.g. Bartender" className="h-11 border-landing-hairline" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-brand-teal-deep">Description</Label>
            <Input {...register('description')} placeholder="Brief description" className="h-11 border-landing-hairline" />
          </div>
        </form>
      </FormSheet>

      <FormSheet
        open={!!editSkill}
        onOpenChange={(open) => !open && setEditSkill(null)}
        title="Edit skill"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditSkill(null)}>Cancel</Button>
            <Button type="submit" form="edit-skill-form" disabled={editSubmitting} className={primaryBtnClass}>
              {editSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form id="edit-skill-form" onSubmit={handleEditSubmit(onEdit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-brand-teal-deep">Skill name *</Label>
            <Input {...regEdit('name', { required: true })} className="h-11 border-landing-hairline" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-brand-teal-deep">Description</Label>
            <Input {...regEdit('description')} className="h-11 border-landing-hairline" />
          </div>
        </form>
      </FormSheet>

      <FormSheet
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete skill?"
        description={`This will permanently delete ${deleteConfirm?.name ?? 'this skill'}. Staff with this skill will lose it.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={onDelete} disabled={actioning}>
              {actioning ? 'Deleting…' : 'Delete skill'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-landing-steel">
          This action cannot be undone. Consider removing the skill from active schedules first.
        </p>
      </FormSheet>
    </div>
  );
}
