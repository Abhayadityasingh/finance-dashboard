// src/Charts.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6"];

export function BalanceTrendChart({ transactions }) {
  // Create dummy balance trend data
  const data = transactions.map((t, i) => ({
    date: t.date,
    balance: t.type === "income" ? t.amount : -t.amount,
  })).reduce((acc, curr, i) => {
    if (i === 0) acc.push({ date: curr.date, balance: curr.balance });
    else acc.push({ date: curr.date, balance: acc[i-1].balance + curr.balance });
    return acc;
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <LineChart width={400} height={250} data={data}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="balance" stroke="#4F46E5" strokeWidth={3} />
      </LineChart>
    </div>
  );
}

export function SpendingBreakdownChart({ transactions }) {
  const expenseTransactions = transactions.filter(t => t.type === "expense");
  const categoryMap = {};
  expenseTransactions.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const data = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <PieChart width={400} height={250}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </div>
  );
}