'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { LoginInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { apiClient } from '@/lib/api/client/client';
import type { LoginResponse } from '@/types/auth';
import { cn } from '@/lib/utils';

export interface LoginFormProps {
  className?: string;
}

export function LoginForm({
  className,
  ...props
}: LoginFormProps & React.ComponentProps<'div'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/dashboard';
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    defaultValues: { email: '', password: '', rememberMe: true },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: LoginInput) {
    try {
      const res = await apiClient.post<LoginResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });
      const { accessToken, refreshToken, session } = res.data;
      setAuth(accessToken, session, data.rememberMe ?? true, refreshToken);
      toast.success('Signed in successfully');
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string })?.message ??
          (err.response?.data as { error?: string })?.error ??
          err.message;
        const status = err.response?.status;
        if (status === 401) {
          setError('root', {
            type: 'manual',
            message: 'Invalid email or password.',
          });
        } else {
          setError('root', {
            type: 'manual',
            message: msg || 'Login failed. Please try again.',
          });
        }
      } else {
        setError('root', {
          type: 'manual',
          message: 'Something went wrong. Please try again.',
        });
      }
    }
  }

  return (
    <div className={cn('flex flex-col gap-8', className)} {...props}>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-medium tracking-tight text-landing-ink">
          Welcome back
        </h1>
        <p className="text-sm leading-relaxed text-landing-steel">
          Sign in to manage schedules, swaps, and staff across your locations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FieldGroup className="gap-5">
          {errors.root && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {errors.root.message}
            </div>
          )}

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="text-landing-ink">
              Work email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="h-11 rounded-lg border-landing-hairline bg-white px-3.5 text-base focus-visible:border-brand-green focus-visible:ring-brand-green/25 md:text-sm"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor="password" className="text-landing-ink">
                Password
              </FieldLabel>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="h-11 rounded-lg border-landing-hairline bg-white px-3.5 text-base focus-visible:border-brand-green focus-visible:ring-brand-green/25 md:text-sm"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                className="size-4 rounded border-landing-hairline text-brand-green focus:ring-brand-green/30"
              />
              <span className="text-sm text-landing-steel">Keep me signed in</span>
            </label>
            <FieldDescription className="text-landing-muted">
              Extends how long your session stays active on this device
            </FieldDescription>
          </Field>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-full bg-brand-green font-display text-sm font-semibold text-brand-teal-deep shadow-none hover:bg-brand-green/90 focus-visible:ring-brand-green/40"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-landing-steel">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-brand-green-dark underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
