'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'failed';

const statusCopy: Record<ConnectionStatus, string> = {
  connected: 'Live',
  disconnected: 'Offline',
  reconnecting: 'Reconnecting',
  failed: 'Paused',
};

const dotColor: Record<ConnectionStatus, string> = {
  connected: 'bg-brand-green',
  disconnected: 'bg-landing-muted',
  reconnecting: 'bg-landing-accent-orange animate-pulse',
  failed: 'bg-destructive',
};

export function SocketStatus({ compact }: { compact?: boolean }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onReconnectAttempt = () => setStatus('reconnecting');
    const onReconnectFailed = () => setStatus('failed');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect_failed', onReconnectFailed);

    if (socket.connected) setStatus('connected');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.io.off('reconnect_failed', onReconnectFailed);
    };
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs',
        compact ? 'text-landing-steel' : 'text-muted-foreground',
      )}
    >
      <span
        className={cn('size-2 rounded-full', dotColor[status])}
        title={statusCopy[status]}
      />
      <span className="font-medium">{statusCopy[status]}</span>
      {!compact && status === 'failed' && (
        <span className="text-destructive">· Live updates paused</span>
      )}
    </div>
  );
}
