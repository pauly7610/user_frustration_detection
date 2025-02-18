import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { Alert } from '../models/database/Alert';

export function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                setLoading(true);
                const data = await apiClient.get('/alerts');
                setAlerts(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
    }, []);

    return { alerts, loading, error };
} 