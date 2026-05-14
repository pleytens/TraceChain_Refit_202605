import React, { useState, useEffect, useRef } from "react";

// ── Stat Card ──────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({
  label, value, icon, color,
}) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
    </div>
  </div>
);

// ── Mini Bar Chart (CSS only) ──────────────────────────────
const BarChart: React.FC<{ data: number[]; labels: string[]; title: string }> = ({
  data, labels, title,
}) => {
  const max = Math.max(...data);
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-36">
        {data.map((v, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs text-gray-500">{v}</span>
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${max ? (v / max) * 100 : 0}%` }}
            />
            <span className="text-xs text-gray-400 truncate w-full text-center">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Donut / Pie (CSS conic-gradient) ───────────────────────
const PieChart: React.FC<{ active: number; expired: number }> = ({ active, expired }) => {
  const total = active + expired;
  const activePct = total ? Math.round((active / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-28 h-28 rounded-full"
        style={{
          background: `conic-gradient(#22c55e 0% ${activePct}%, #ef4444 ${activePct}% 100%)`,
        }}
      />
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Active ({active})</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Expired ({expired})</span>
      </div>
    </div>
  );
};

// ── Supplier Status Table ───────────────────────────────────
const supplierRows = [
  { name: "Green Farm Co.", gs1: "8936069", email: "admin@greenfarm.com", status: "active", date: "2024-01-15" },
  { name: "Mekong Fish Ltd.", gs1: "8936070", email: "info@mekong.com", status: "active", date: "2024-02-20" },
  { name: "Angkor Foods", gs1: "8936071", email: "contact@angkor.com", status: "expired", date: "2023-11-01" },
  { name: "KBF Trading", gs1: "8936072", email: "kbf@trade.com", status: "active", date: "2024-03-10" },
  { name: "Sunrise Produce", gs1: "8936073", email: "hello@sunrise.com", status: "expired", date: "2023-09-05" },
];

// ── Dashboard Page ─────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [debouncedTableSearch, setDebouncedTableSearch] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time debounced search for supplier table
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedTableSearch(tableSearch), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [tableSearch]);

  const filteredRows = supplierRows.filter(
    (r) =>
      !debouncedTableSearch ||
      r.name.toLowerCase().includes(debouncedTableSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(debouncedTableSearch.toLowerCase()) ||
      r.gs1.includes(debouncedTableSearch)
  );

  const stats = [
    { label: "Total Products", value: 142, icon: "📦", color: "bg-blue-50" },
    { label: "Suppliers", value: 38, icon: "🏭", color: "bg-indigo-50" },
    { label: "Recordings", value: 1_204, icon: "📝", color: "bg-yellow-50" },
    { label: "QR Scans", value: 9_871, icon: "📱", color: "bg-purple-50" },
  ];

  const barData = [120, 180, 90, 210, 160, 230, 195];
  const barLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      {/* Onboarding welcome banner – shown until dismissed */}
      {showOnboarding && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold mb-1">👋 Welcome to TraceChain Customer Portal!</h2>
              <p className="text-sm text-blue-100 mb-3">
                Here's how to get started quickly:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-100">
                <li>Go to <strong className="text-white">Process</strong> – create your first traceability process</li>
                <li>Go to <strong className="text-white">Recording</strong> – capture traceability data for each step</li>
                <li>Go to <strong className="text-white">Products</strong> – link products to your processes</li>
                <li>Manage your team in <strong className="text-white">People Management</strong></li>
              </ol>
            </div>
            <button
              onClick={() => setShowOnboarding(false)}
              className="text-blue-200 hover:text-white text-lg shrink-0 mt-0.5"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">✓ Step 1: Create a Process</span>
            <span className="bg-white/10 text-blue-200 text-xs px-3 py-1 rounded-full">○ Step 2: Add Recordings</span>
            <span className="bg-white/10 text-blue-200 text-xs px-3 py-1 rounded-full">○ Step 3: Link Products</span>
          </div>
        </div>
      )}
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* QR Scan Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">QR Code Shares (This Week)</h3>
            <div className="flex gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
              />
            </div>
          </div>
          <BarChart data={barData} labels={barLabels} title="" />
        </div>

        {/* Supplier Status Pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Supplier Status</h3>
          <PieChart active={28} expired={10} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">28</p>
              <p className="text-xs text-gray-500 mt-1">Active</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">10</p>
              <p className="text-xs text-gray-500 mt-1">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Info Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Supplier Information</h3>
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search… (live)"
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Actions</th>
                <th className="px-5 py-3 text-left">GS1 Code</th>
                <th className="px-5 py-3 text-left">Supplier Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                      ⚙ Actions
                    </button>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{row.gs1}</td>
                  {/* text-wrap fix: break-words and min-w */}
                  <td className="px-5 py-3 font-medium text-gray-800 break-words min-w-[120px]">{row.name}</td>
                  <td className="px-5 py-3 text-gray-500 break-all min-w-[140px]">{row.email}</td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{row.date}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.status === "active" ? "Active" : "Expired"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm text-gray-400">
                    No results for "{tableSearch}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
