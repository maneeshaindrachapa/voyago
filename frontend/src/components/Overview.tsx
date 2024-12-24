import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useTheme } from '../context/ThemeContext'; // Assuming you have a ThemeContext

const data = Array.from({ length: 12 }, (_, index) => ({
  name: new Date(0, index).toLocaleString('default', { month: 'short' }),
  total: Math.floor(Math.random() * 5000) + 1000, // Random data generation
}));

export function Overview() {
  const { theme } = useTheme(); // Access the current theme (light or dark)

  // Dynamic colors based on theme
  const axisColor = theme === 'dark' ? '#cccccc' : '#888888';
  const barFillColor = theme === 'dark' ? '#4f46e5' : '#2563eb'; // Example colors

  return (
    <div className="p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Monthly Overview
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Bar dataKey="total" fill={barFillColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
