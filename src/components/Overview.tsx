import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const data = Array.from({ length: 12 }, (_, index) => ({
  name: new Date(0, index).toLocaleString('default', { month: 'short' }),
  total: Math.floor(Math.random() * 5000) + 1000, // Random data generation
}));

export function Overview() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
