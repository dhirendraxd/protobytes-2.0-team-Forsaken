import { useBackendConnection } from '@/hooks/useApi';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export function ConnectionStatus() {
  const health = useBackendConnection();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {health.status === 'loading' && (
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{health.message}</span>
        </div>
      )}

      {health.status === 'connected' && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
          <Check className="w-4 h-4" />
          <span className="text-sm">Backend connected</span>
        </div>
      )}

      {health.status === 'disconnected' && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{health.error}</span>
        </div>
      )}
    </div>
  );
}
