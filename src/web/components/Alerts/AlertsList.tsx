import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Alert } from '../../../models/database/Alert';

export const AlertsList: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setAlerts(data);
      }
    };

    fetchAlerts();

    // Subscribe to new alerts
    const channel = supabase.channel('alerts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          setAlerts(current => [payload.new as Alert, ...current].slice(0, 50));
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const getSeverityColor = (severity: number): string => {
    if (severity >= 8) return 'bg-red-100 text-red-800';
    if (severity >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recent Alerts</h2>
      <div className="divide-y divide-gray-200">
        {alerts.map(alert => (
          <div key={alert.id} className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className={`px-2 py-1 rounded-full text-sm ${getSeverityColor(alert.severity)}`}>
                  Severity: {alert.severity}
                </span>
                <p className="mt-1 text-sm text-gray-500">
                  Session: {alert.sessionId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              {alert.type}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};