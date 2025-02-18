import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { createClient } from '@supabase/supabase-js';
import _ from 'lodash';

interface DashboardProps {
  timeRange: 'day' | 'week' | 'month';
}

interface FrustrationData {
  created_at: string;
  frustration_score: number;
}

export const FrustrationDashboard: React.FC<DashboardProps> = ({ timeRange }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: frustrationData, error } = await supabase
      .from('sessions')
      .select('created_at, frustration_score')
      .gte('created_at', getTimeRangeStart(timeRange))
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    const aggregatedData = aggregateData(frustrationData as FrustrationData[]);
    setData(aggregatedData);
    setLoading(false);
  };

  const getTimeRangeStart = (range: 'day' | 'week' | 'month') => {
    const date = new Date();
    switch (range) {
      case 'day':
        date.setDate(date.getDate() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
    }
    return date.toISOString();
  };

  const aggregateData = (rawData: FrustrationData[]) => {
    // Group by hour/day depending on timeRange
    const groupedData = _.groupBy(rawData, (item) => {
      const date = new Date(item.created_at);
      return timeRange === 'day' 
        ? date.getHours()
        : date.toISOString().split('T')[0];
    });

    return Object.entries(groupedData).map(([timeKey, group]) => ({
      time: timeKey,
      averageScore: _.meanBy(group, 'frustration_score'),
      maxScore: _.maxBy(group, 'frustration_score')?.frustration_score
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Frustration Trends</h2>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="averageScore" 
              stroke="#8884d8" 
              name="Average Frustration"
            />
            <Line 
              type="monotone" 
              dataKey="maxScore" 
              stroke="#82ca9d" 
              name="Peak Frustration"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};