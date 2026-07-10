'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { AuthSocialButtons } from '@/components/auth/auth-social-buttons';
import { getGoogleAuthUrl } from '@/lib/auth/google-oauth';
import { cn } from '@/lib/utils';

interface SignupFields {
  firstName: string;
  lastName: string;
  organizationName: string;
  email: string;
  password: string;
}

export interface SignupFormProps {
  className?: string;
  googleEnabled?: boolean;
}

export function SignupForm({
  className,
  googleEnabled = false,
  ...props
}: SignupFormProps & React.ComponentProps<'div'>) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFields>({
    defaultValues: {
      firstName: '',
      lastName: '',
      organizationName: '',
      email: '',
      password: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: SignupFields) {
    try {
      sessionStorage.setItem(
        'shiftsync_signup_intent',
        JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationName: data.organizationName,
          submittedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // sessionStorage may be unavailable
    }

    toast.success('Request received', {
      description:
        'Your workspace admin will provision your account. Use demo credentials to explore the product now.',
    });
    router.push('/login');
  }

  function signUpWithGoogle() {
    window.location.assign(getGoogleAuthUrl('/dashboard'));
  }

  return (
    <div className={cn('flex flex-col gap-8', className)} {...props}>
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-medium tracking-tight text-landing-ink">
          Create your account
        </h1>
        <p className="text-sm leading-relaxed text-landing-steel">
          Get started with ShiftSync.
        </p>
      </div>

      <AuthSocialButtons
        onGoogle={signUpWithGoogle}
        disabled={isSubmitting}
        googleEnabled={googleEnabled}
      />

      {googleEnabled && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-landing-hairline" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 font-medium tracking-wider text-landing-muted">
              or continue with email
            </span>
          </div>
        </div>
      )}

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

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName" className="text-landing-ink">
                First name
              </FieldLabel>
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="Alex"
                aria-invalid={!!errors.firstName}
                className="h-11 rounded-lg border-landing-hairline bg-white px-3.5 text-base focus-visible:border-brand-green focus-visible:ring-brand-green/25 md:text-sm"
                {...register('firstName', {
                  required: 'First name is required',
                })}
              />
              <FieldError errors={[errors.firstName]} />
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName" className="text-landing-ink">
                Last name
              </FieldLabel>
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Rivera"
                aria-invalid={!!errors.lastName}
                className="h-11 rounded-lg border-landing-hairline bg-white px-3.5 text-base focus-visible:border-brand-green focus-visible:ring-brand-green/25 md:text-sm"
                {...register('lastName', {
                  required: 'Last name is required',
                })}
              />
              <FieldError errors={[errors.lastName]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.organizationName}>
            <FieldLabel htmlFor="organizationName" className="text-landing-ink">
              Organization
            </FieldLabel>
            <Input
              id="organizationName"
              autoComplete="organization"
              placeholder="Coastal Eats Group"
              aria-invalid={!!errors.organizationName}
              className="h-11 rounded-lg border-landing-hairline bg-white px-3.5 text-base focus-visible:border-brand-green focus-visible:ring-brand-green/25 md:text-sm"
              {...register('organizationName', {
                required: 'Organization is required',
              })}
            />
            <FieldError errors={[errors.organizationName]} />
          </Field>

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
            <FieldLabel htmlFor="password" className="text-landing-ink">
              Password
            </FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="h-11 rounded-lg border-landing-hairline bg-white px-3.5 text-base focus-visible:border-brand-green focus-visible:ring-brand-green/25 md:text-sm"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-full bg-brand-green font-display text-sm font-semibold text-brand-teal-deep shadow-none hover:bg-brand-green/90 focus-visible:ring-brand-green/40"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>


      <p className="text-center text-sm text-landing-steel">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-brand-green-dark underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
