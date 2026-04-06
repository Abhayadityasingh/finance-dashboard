import { useState, useEffect } from "react";
import { BalanceTrendChart, SpendingBreakdownChart } from "./Charts";

// Sample summary data
const summaryData = {
  balance: 12500,
  income: 7000,
  expenses: 4300,
};

// Sample initial transactions
const initialTransactions = [
  { id: 1, date: "2026-04-01", amount: 2000, category: "Salary", type: "income" },
  { id: 2, date: "2026-04-02", amount: 500, category: "Food", type: "expense" },
  { id: 3, date: "2026-04-03", amount: 1000, category: "Rent", type: "expense" },
];

// Summary Card Component
function SummaryCard({ title, amount, gradient }) {
  return (
    <div className={`p-6 rounded-xl shadow-xl text-white ${gradient} flex flex-col transition-transform transform hover:scale-105`}>
      <span className="text-sm uppercase">{title}</span>
      <span className="mt-2 text-2xl font-bold">${amount.toLocaleString()}</span>
    </div>
  );
}

function App() {
  const [role, setRole] = useState("viewer");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [form, setForm] = useState({ id: null, date: "", category: "", type: "income", amount: "" });
  const [isEditing, setIsEditing] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch = t.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.category || !form.amount) return alert("Fill all fields.");
    const newTransaction = { id: isEditing ? form.id : Date.now(), ...form, amount: parseFloat(form.amount) };
    setTransactions(isEditing ? transactions.map(t => t.id === form.id ? newTransaction : t) : [...transactions, newTransaction]);
    setForm({ id: null, date: "", category: "", type: "income", amount: "" });
    setIsEditing(false);
  };

  const handleEdit = (t) => { setForm(t); setIsEditing(true); };
  const handleDelete = (id) => setTransactions(transactions.filter(t => t.id !== id));

  const exportCSV = () => {
    if (!transactions.length) return alert("No transactions to export!");
    const header = "Date,Category,Type,Amount\n";
    const rows = transactions.map(t => `${t.date},${t.category},${t.type},${t.amount}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  const getInsights = () => {
    const expenses = transactions.filter(t => t.type === "expense");
    if (!expenses.length) return { highestCategory: "N/A" };
    const totals = {};
    expenses.forEach(t => totals[t.category] = (totals[t.category] || 0) + t.amount);
    const highestCategory = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
    return { highestCategory };
  };
  const insights = getInsights();

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={`${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100"} min-h-screen p-8 transition-colors duration-300`}>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <label className="font-medium">Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded px-3 py-1 dark:bg-gray-700 dark:text-white">
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="border px-3 py-1 rounded">{darkMode ? "Light Mode" : "Dark Mode"}</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Total Balance" amount={totalIncome - totalExpenses} gradient="bg-gradient-to-r from-indigo-500 to-indigo-700" />
        <SummaryCard title="Income" amount={totalIncome} gradient="bg-gradient-to-r from-emerald-500 to-emerald-700" />
        <SummaryCard title="Expenses" amount={totalExpenses} gradient="bg-gradient-to-r from-rose-500 to-rose-700" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Balance Trend</h2>
          <BalanceTrendChart transactions={transactions} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Spending Breakdown</h2>
          <SpendingBreakdownChart transactions={transactions} />
        </div>
      </div>

      {/* Insights */}
      <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Insights</h2>
        <p>Highest spending category: <span className="font-semibold">{insights.highestCategory}</span></p>
      </div>

      {/* Admin Form */}
      {role === "admin" && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md">
          <h3 className="font-semibold mb-4">{isEditing ? "Edit Transaction" : "Add Transaction"}</h3>
          <form className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4" onSubmit={handleSubmit}>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white" />
            <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white" />
            <select name="type" value={form.type} onChange={handleChange} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} className="border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white" />
            <button type="submit" className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white px-4 py-2 rounded shadow-md">{isEditing ? "Update" : "Add"}</button>
          </form>
          <button onClick={exportCSV} className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded shadow-md">Export CSV</button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>
        <input type="text" placeholder="Search category..." value={search} onChange={(e) => setSearch(e.target.value)} className="border px-3 py-2 rounded mb-4 w-full dark:bg-gray-700 dark:text-white" />
        <div className="flex gap-3 mb-4">
          {["all","income","expense"].map(type => (
            <button key={type} onClick={() => setFilter(type)} className={`px-3 py-1 rounded shadow-md capitalize ${filter===type ? "bg-indigo-500 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-indigo-400 hover:text-white transition"}`}>{type}</button>
          ))}
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No transactions found.</p>
        ) : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Category</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Amount</th>
                {role === "admin" && <th className="py-2 px-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t,i) => (
                <tr key={t.id} className={`border-b hover:bg-indigo-50 dark:hover:bg-gray-600 transition ${i%2===0 ? "bg-gray-50 dark:bg-gray-700" : "bg-white dark:bg-gray-800"}`}>
                  <td className="py-2 px-2">{t.date}</td>
                  <td className="py-2 px-2">{t.category}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${t.type==="income" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`py-2 px-2 font-semibold ${t.type==="income" ? "text-emerald-500":"text-rose-500"}`}>${t.amount.toLocaleString()}</td>
                  {role === "admin" && (
                    <td className="py-2 px-2 flex gap-2">
                      <button onClick={() => handleEdit(t)} className="text-indigo-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="text-rose-600 hover:underline">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {/* Total Row */}
              <tr className="font-semibold border-t bg-gray-100 dark:bg-gray-700">
                <td className="py-2 px-2">-</td>
                <td className="py-2 px-2">Totals</td>
                <td className="py-2 px-2">-</td>
                <td className="py-2 px-2">${(totalIncome - totalExpenses).toLocaleString()}</td>
                {role === "admin" && <td className="py-2 px-2">-</td>}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;