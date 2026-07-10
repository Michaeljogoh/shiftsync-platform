'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingStore {
  adminCreateUserGuideDismissed: boolean;
  _hasHydrated: boolean;
  dismissAdminCreateUserGuide: () => void;
  resetAdminCreateUserGuide: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      adminCreateUserGuideDismissed: false,
      _hasHydrated: false,
      dismissAdminCreateUserGuide: () => set({ adminCreateUserGuideDismissed: true }),
      resetAdminCreateUserGuide: () => set({ adminCreateUserGuideDismissed: false }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'shiftsync-onboarding',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            },
      ),
      partialize: (state) => ({
        adminCreateUserGuideDismissed: state.adminCreateUserGuideDismissed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
