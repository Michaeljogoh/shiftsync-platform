'use client';

import { useEffect } from 'react';
import { pingWakeApi } from '@/lib/api/wake-api';

/**
 * Starts warming the hosted API as soon as the app loads (prod only).
 * Non-blocking; throttled via sessionStorage in pingWakeApi().
 */
export function WakeApiOnVisit() {
  useEffect(() => {
    pingWakeApi();
  }, []);

  return null;
}
