'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface IssueStatusChartProps {
  data: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
}

const COLORS = {
  open: '#f59e0b', // yellow-500
  in_progress: '#3b82f6', // blue-500
  resolved: '#10b981', // green-500
  closed: '#6b7280', // gray-500
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function IssueStatusChart({ data }: IssueStatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
      value,
      color: COLORS[key as keyof typeof COLORS],
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-300">
        <p>No issue data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({name, percent}) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
