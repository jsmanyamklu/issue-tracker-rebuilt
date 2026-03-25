'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IssuePriorityChartProps {
  data: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const COLORS = {
  low: '#6b7280', // gray-500
  medium: '#3b82f6', // blue-500
  high: '#f59e0b', // yellow-500
  critical: '#ef4444', // red-500
};

export function IssuePriorityChart({ data }: IssuePriorityChartProps) {
  const chartData = [
    { name: 'Low', value: data.low, color: COLORS.low },
    { name: 'Medium', value: data.medium, color: COLORS.medium },
    { name: 'High', value: data.high, color: COLORS.high },
    { name: 'Critical', value: data.critical, color: COLORS.critical },
  ];

  const hasData = chartData.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No priority data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
